import json

def parse_content(filepath):
    with open(filepath, 'r') as file:
        data = json.load(file) 
        print(data)
    return data #returning a Python dictionary 

if __name__ == "__main__": 
    json_file_path = 'data.json'

    parse_content(json_file_path)