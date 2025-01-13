import os
import sys

def debug_info():
    print("=== Python Environment Debug Info ===")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Directory contents: {os.listdir('.')}")
    print(f"Python path: {sys.path}")
    if os.path.exists('api'):
        print(f"API directory contents: {os.listdir('api')}")
    print("=== End Debug Info ===") 