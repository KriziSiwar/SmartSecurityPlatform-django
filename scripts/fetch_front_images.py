import os
import shutil
import urllib.request


def ensure_directory_exists(path: str) -> None:
	if not os.path.isdir(path):
		os.makedirs(path, exist_ok=True)


def download_image(url: str, dest_path: str) -> None:
	try:
		with urllib.request.urlopen(url, timeout=30) as response:
			data = response.read()
		with open(dest_path, 'wb') as f:
			f.write(data)
		print(f"Saved: {dest_path}")
	except Exception as e:
		print(f"Failed to fetch {url} -> {dest_path}: {e}")


def main() -> None:
	# Target directory inside the project
	project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
	images_dir = os.path.join(project_root, 'SmartSecurityPlatform', 'static', 'Front', 'images')
	ensure_directory_exists(images_dir)

	# Deterministic placeholder images from picsum.photos (royalty-free placeholders)
	# You can replace these later with your own images.
	images = [
		('banner.jpg', 'security-banner'),
		('security_camera.jpg', 'security-camera'),
		('control_room.jpg', 'control-room'),
		('smart_home.jpg', 'smart-home'),
		('cctv_street.jpg', 'cctv-street'),
		('data_dashboard.jpg', 'data-dashboard'),
		('facial_recognition.jpg', 'facial-recognition'),
	]

	# Higher resolution for banner, standard for others
	for filename, seed in images:
		if filename == 'banner.jpg':
			url = f'https://picsum.photos/seed/{seed}/1920/1080'
		else:
			url = f'https://picsum.photos/seed/{seed}/1200/800'
		dest = os.path.join(images_dir, filename)
		download_image(url, dest)

	# Create aliases expected by the HTML templates
	aliases = [
		('smart_home.jpg', 'pic01.jpg'),
		('security_camera.jpg', 'pic02.jpg'),
		('control_room.jpg', 'pic03.jpg'),
		('cctv_street.jpg', 'pic04.jpg'),
		('data_dashboard.jpg', 'pic05.jpg'),
	]
	for src_name, alias_name in aliases:
		src_path = os.path.join(images_dir, src_name)
		alias_path = os.path.join(images_dir, alias_name)
		if os.path.isfile(src_path):
			try:
				shutil.copyfile(src_path, alias_path)
				print(f"Aliased {src_name} -> {alias_name}")
			except Exception as e:
				print(f"Failed to create alias {alias_name} from {src_name}: {e}")

	print("Done. If some files were already present, they were left untouched or overwritten based on fetch result.")


if __name__ == '__main__':
	main()


