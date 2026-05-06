from PIL import Image
import os

base_dir = "public/templates/"
img1_path = os.path.join(base_dir, "template1.png")
img2_path = os.path.join(base_dir, "template2.png")

# template1.png is a screenshot of resume-now.com. It actually seems to just be a blank page with "Templates we recommend for you"
# So let's focus on template2.png which has the actual templates.

if os.path.exists(img2_path):
    img2 = Image.open(img2_path)
    width, height = img2.size
    
    # Estimate the bounding boxes for the 3 resumes in the template2.png image
    # The image has a blue outline around the first one.
    
    # Kelly Blackwell (Left)
    kelly_box = (60, 240, 500, 850) # left, upper, right, lower
    
    # Howard Jones (Middle)
    howard_box = (510, 240, 930, 850)
    
    # Samantha Williams (Right - partially cut off)
    # samantha_box = (950, 240, width, 850)
    
    # Let's crop them
    try:
        img_kelly = img2.crop(kelly_box)
        img_kelly.save(os.path.join(base_dir, "thumb_kelly.png"))
        print("Saved thumb_kelly.png")
    except Exception as e:
        print("Error cropping kelly:", e)
        
    try:
        img_howard = img2.crop(howard_box)
        img_howard.save(os.path.join(base_dir, "thumb_howard.png"))
        print("Saved thumb_howard.png")
    except Exception as e:
        print("Error cropping howard:", e)

