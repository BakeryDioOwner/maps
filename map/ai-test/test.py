from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from openai import OpenAI  # 改用 OpenAI SDK

app = Flask(__name__)
CORS(app)

def call_ai_integration(results):
    """
    使用 DeepSeek API 对 POI 信息进行整合处理
    """
    # 初始化 OpenAI 客户端，配置 DeepSeek API（兼容openai的按理来说都能用）
    client = OpenAI(
        api_key="",
        base_url="https://api.deepseek.com/v1"  # DeepSeek API 基础URL
    )

    # 构建提示词
    poi_details = []
    for poi in results:
        detail = f"名称：{poi.get('name', '未知')}\n"
        detail += f"地址：{poi.get('address', '未知')}\n"
        detail += f"类型：{poi.get('type', '未知')}\n"
        if poi.get('distance'):
            detail += f"距离：{poi.get('distance')}米\n"
        poi_details.append(detail)

    prompt = "请根据以下地点信息，生成一段简洁的介绍，重点描述这些地点的特点和位置关系：\n\n"
    prompt += "\n---\n".join(poi_details)

    try:
        # 使用 OpenAI SDK 调用 API
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个帮助整理地理位置信息的助手"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # 获取响应内容
        integration_text = response.choices[0].message.content
        print("API 响应内容:", integration_text)
        return integration_text

    except Exception as e:
        print(f"API 调用错误: {str(e)}")
        # 返回备选结果
        names = [poi.get('name', '未知') for poi in results]
        return "附近的地点包括：" + "、".join(names)

@app.route('/process', methods=['POST'])
def process():
    print("收到请求")  # 添加调试信息
    data = request.get_json()
    print("请求数据:", data)  # 添加调试信息
    results = data.get('results', [])

    # 将结果写入 txt 文件
    try:
        with open('results.txt', 'w', encoding='utf-8') as f:
            f.write(json.dumps(results, ensure_ascii=False, indent=4))
        print("文件写入成功")  # 添加调试信息
    except Exception as e:
        print("写文件错误：", e)
        return jsonify({'error': '写文件错误'}), 500

    # 调用 AI 整合处理
    try:
        integration = call_ai_integration(results)
        print("AI 处理结果:", integration)  # 添加调试信息
        return jsonify({'integration': integration})
    except Exception as e:
        print("AI 处理错误:", str(e))  # 添加调试信息
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
