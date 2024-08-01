title: How to use my blog
description: learn how to deploy my website and blog for yourself
createdAt: 2024/7/31

---

Hello all, first I feel like I should introduce myself, my name is Dan Habot and I write code. I've worked on apps, websites, the servers that support them.. the computers. It's all the same after after awhile. Because I assert that I am also a webdeveloper I've gotta have my own website, I'm really not sure what to put on it so I thought I'd just make it a list of links and a blog. The links are good for when I go to networking events, I can put a QR code on my buisness cards or stick a QR code sticker to the back of my phone for easy sharing.

I wrote my website in [Next.js](https://nextjs.org/) deploy it to [Github Pages](https://pages.github.com/) for free. I'll even show you how to get a [`is-a.dev`](https://www.is-a.dev/) domain name just for that extra touch.

### Prerequisites

* **This tutorial assumes that you already know how to code**. It should be ridiculously difficult to do even if you're not a programmer.
* Have a [github.com](https://github.com/) account.

### Step 1: Forking the repo

[Link to the repo](https://github.com/danhab99/danhab99.github.io)

The git repo already has Github actions prepared for deploying the next.js app to GH Pages. To get started simply click the `Fork` button on the top right:

![where the fork button is](/blog-images/fork_button.png)

Make sure to change the name of the repo to `[YOUR GITHUB USERNAME HERE].github.io`.

![change the name](/blog-images/change_repo_name.png)

### Step 2: Enabling Github Actions

Click the "Settings" tab and go to "Actions" on the left side, the first thing you see is 4 options. Make sure that "Allow all actions and reusable workflows" is selected and click save.

### Step 3: Deploying Github pages

After you're in the "Settings" tab you should find "Pages" afew spots below "Actions". Under "Build and deployment" make sure "source" is set to "Github Actions". This will allow the Actions pipeline to upload the compiled website to github pages.

> Make sure that Enforce HTTPS is enabled

### Step 4: Customizing the website

Full disclosure, this is going to involve some programming.

The landing page is in `app/page.tsx`. Between lines 30 and 85 you'll see repeating `<Card` blocks, these represent the link cards that you see on the landing page.

```tsx
<Card
  title="Email"
  color="red"
  icon={IoMdMail}
  label="dan.habot@gmail.com"
  link="mailto:dan.habot@gmail.com"
/>
```

* `title=""` The text on time of the card
* `color=""` Names of colors can be found [here](https://tailwindcss.com/docs/customizing-colors)
* `label=""` The bottom text
* `link=""` A url or email

Setting different icons can be difficult. First pick an icon from [the react icons website](https://react-icons.github.io/react-icons/icons/io/). Click on which-ever one you like. At the bottom of that side panel there are buttons for copying the icons name to your clipboard, make sure to click on the **2nd** one from the top. Then paste that into the list of icons on line 14 and in between the `icon=`'s curly braces, remember that the icon name doesn't need quotes (`""`).

### How to write blogs

Blogs are a combination of a [YAML file](https://yaml.org/) and a [Markdown file](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax). To get started create a new `.md` file in `blogs/`. The name of the file will be the link to that blog.

The format of the file goes like this:

```
title: BLOG TITLE HERE
description: BLOG DESCRIPTION HERE
createdAt: YYYY/MM/DD

---

## Write your blog here
```

Once you commit and push a new blog github actions will build the blog page and publish it for all to read!

### Conclusion

Anways I hope I covered everything, if you have any questions feel free to send me an email and I'll get back to you as soon as I can.
