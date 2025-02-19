import requests
import json
from datetime import datetime

class DeepSeekClient:
    def __init__(self):
        self.api_key = "sk-fmybytotkerztuyoxsmodfhdhuetfilxnuxxbsjgryonbgmh"
        self.api_base = "https://api.deepseek.com/v1"
        self.model = "deepseek-chat"  # 使用 DeepSeek Chat v3 模型

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
                "temperature": temperature
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

def generate_personal_review(client, place_name, user_review):
    """
    基于用户评价生成个性化游记
    :param client: DeepSeek客户端实例
    :param place_name: 地点名称
    :param user_review: 用户评价信息
    :return: 生成的个性化游记
    """
    # 构建提示词
    prompt = f"""
    请基于以下用户评价，以第一人称的口吻生成一段生动的游记：
    
    地点：{place_name}
    评分：{user_review['评分']}分
    优点：{user_review['优点'] or '未提供'}
    建议：{user_review['建议'] or '未提供'}
    游玩建议：{user_review['游玩建议'] or '未提供'}
    其他评价：{user_review['其他评价'] or '未提供'}
    
    要求：
    1. 以"我"的口吻描述
    2. 融入用户的具体评价内容
    3. 语言要生动自然
    4. 控制在200字左右
    5. 突出个人体验和感受
    """

    messages = [
        {"role": "system", "content": "你是一位擅长写游记的旅行作家。"},
        {"role": "user", "content": prompt}
    ]

    response = client.create_chat_completion(messages)
    
    if response:
        return response['choices'][0]['message']['content']
    else:
        return "抱歉，无法生成个性化游记。"

def main():
    client = DeepSeekClient()
    
    print("欢迎使用地点介绍系统！")
    print("输入'quit'退出程序\n")

    while True:
        place = input("\n请输入您想了解的地点名称: ").strip()
        
        if place.lower() == 'quit':
            print("感谢使用，再见！")
            break
        
        if not place:
            print("地点名称不能为空，请重新输入。")
            continue

        # 获取并显示地点介绍
        print("\n正在生成介绍...")
        description = get_place_description(client, place)
        print("\n" + "="*50)
        print(f"\n关于 {place} 的介绍：\n")
        print(description)
        print("\n" + "="*50)

        # 询问是否要提供评价
        if input("\n您想对这个地点提供评价吗？(y/n): ").lower().strip() == 'y':
            review = collect_user_review(place)
            save_review(review)
            
            # 生成并显示个性化游记
            print("\n正在基于您的评价生成个性化游记...")
            personal_review = generate_personal_review(client, place, review)
            print("\n" + "="*50)
            print("\n您的个性化游记：\n")
            print(personal_review)
            print("\n" + "="*50)

if __name__ == "__main__":
    main()
