# Avatar Narutomaki Trans Flag Adder Tool 🏳️‍⚧️🍥

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![Powered by pnpm](https://img.shields.io/badge/Package%20Manager-pnpm-orange)](https://pnpm.io/)

---

A small tool for quickly adding the **「Narutomaki Trans Flag」** effect to avatars.
Supports **Live Preview, Original Resolution Download**, and is lightweight and ready to use.

---

## 💻 Try it Online

👉 Visit directly: <https://transflag.luoxue.cc>

---

## ✨ Features

- Export in original resolution, clear and not blurry

- Drag-and-drop upload or click to select an image

- Live preview of the avatar effect after applying

- Responsive layout, easy to use on mobile devices

- Clean code, easy to customize and for secondary development

---

## 🚀 How to Use

### Online Usage

1. Open the website: <https://transflag.luoxue.cc>

2. Click "Select File" or drag an image into the upload area

3. See the live preview of the overlaid effect on the right

4. Click "Download Processed Avatar" to save. The resolution will be consistent with the original image (e.g., 2408×2408)

### Local Usage

#### Run Locally

```bash {.line-numbers}
git clone [https://github.com/luoxue3943/trans-avatar-flag-adder](https://github.com/luoxue3943/trans-avatar-flag-adder)
cd trans-avatar-flag-adder
pnpm install
pnpm dev
```

Then visit <http://localhost:3000> 🎉 Of course, it's recommended to check the access address output in the terminal to avoid port conflicts.

## 🧭 Usage Tips

- Supports common image formats: JPEG, PNG, WebP, etc.

- To adjust the flag image, you can directly overwrite the `public/flag.svg` file or modify the import on line 14 of src/app/page.tsx

- To modify the default position of the flag, you can edit line 216 of `src/app/page.tsx`. The value is the distance from the bottom (default is 25px)

## Author

- Author: **珞雪 (Luoxue)**
- Website: Just wait, maybe it will be online again someday

> ⚠️ Disclaimer
> This project was inspired by the work of [**冰棍好烫啊**](https://github.com/bghtnya)
> 👉 [TransFlag_Avatar_Tool](https://github.com/bghtnya/TransFlag_Avatar_Tool)
> This repository does not use any of its source code or assets. It is an independent implementation aimed at improving and expanding upon the functionality and experience.
> Some design ideas were referenced from public discussions by [@meho37371461](https://x.com/meho37371461/status/1984112244053962917).
> If there is any infringement or improper citation, please feel free to contact me for correction.

- 💬 Feedback and suggestions for improvement are welcome!
