import requests
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class GuijiClient:
    def __init__(self):
        self.api_key = "sk-fmybytotkerztuyoxsmodfhdhuetfilxnuxxbsjgryonbgmh"
        self.api_base = "https://api.guiji.ai/api/v1"
        self.model = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"  # 使用硅基流动的DeepSeek模型

    def create_chat_completion(self, messages, temperature=0.7):
        """
        创建聊天完成请求
        :param messages: 消息列表
        :param temperature: 温度参数，控制响应的随机性
        :return: API 响应
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            data = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "stream": False,
                "max_tokens": 2000
            }

            response = requests.post(
                f"{self.api_base}/chat/completions",
                headers=headers,
                json=data
            )

            if response.status_code == 200:
                return response.json()
            else:
                print(f"错误状态码: {response.status_code}")
                print(f"错误信息: {response.text}")
                return None

        except Exception as e:
            print(f"发生错误: {str(e)}")
            return None

def get_place_description(client, place_name):
    # 测试对话
    messages = [
        {"role": "system", "content": "你是一个有帮助的AI助手。"},
        {"role": "user", "content": f"你好，请介绍一下{place_name}。"}
    ]

    # 获取响应
    response = client.create_chat_completion(messages)

    if response:
        # 提取AI的回复
        ai_response = response['choices'][0]['message']['content']
        return ai_response
    else:
        print("获取响应失败")
        return None

def collect_user_review(place_name):
    """
    收集用户对地点的评价
    :param place_name: 地点名称
    :return: 用户评价信息的字典
    """
    print(f"\n请对{place_name}进行评价：")
    
    # 评分
    while True:
        try:
            score = float(input("请给出1-5的评分（5分最高）: "))
            if 1 <= score <= 5:
                break
            print("评分必须在1-5之间，请重新输入。")
        except ValueError:
            print("请输入有效的数字。")
    
    # 收集具体评价
    print("\n请分享您的具体体验（按Enter键提交每一项，直接按Enter可跳过）：")
    
    review = {
        "地点": place_name,
        "评分": score,
        "时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "优点": input("优点: ").strip(),
        "建议": input("建议: ").strip(),
        "游玩建议": input("给其他游客的建议: ").strip(),
        "其他评价": input("其他想说的: ").strip()
    }
    
    return review

def save_review(review):
    """
    保存用户评价到文件
    :param review: 评价信息字典
    """
    try:
        # 读取现有评价
        try:
            with open('place_reviews.json', 'r', encoding='utf-8') as f:
                reviews = json.load(f)
        except FileNotFoundError:
            reviews = []
        
        # 添加新评价
        reviews.append(review)
        
        # 保存所有评价
        with open('place_reviews.json', 'w', encoding='utf-8') as f:
            json.dump(reviews, f, ensure_ascii=False, indent=4)
            
        print("\n评价已保存，感谢您的反馈！")
    except Exception as e:
        print(f"\n保存评价时出错: {str(e)}")

@app.route('/api/place', methods=['POST'])
def get_place_info():
    data = request.json
    place_name = data.get('place')
    
    if not place_name:
        return jsonify({'error': '地点名称不能为空'}), 400
        
    client = GuijiClient()
    description = get_place_description(client, place_name)
    
    return jsonify({
        'description': description
    })

@app.route('/api/review', methods=['POST'])
def submit_review():
    review_data = request.json
    save_review(review_data)
    return jsonify({'message': '评价已保存'})

if __name__ == "__main__":
    app.run(port=5000)
