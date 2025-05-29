from huggingface_hub import HfApi

api = HfApi()
files = api.list_repo_files(repo_id="stabilityai/stable-point-aware-3d")
for file in files:
    print(file)
