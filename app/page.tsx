"use client";

import Image from "next/image";
import { IconType, IconContext } from "react-icons";
import {
  IoMdMail,
  IoMdPhonePortrait,
  IoLogoLinkedin,
  IoLogoInstagram,
  IoLogoGithub,
  IoMdDocument,
  IoMdKey,
  IoIosPaper,
} from "react-icons/io";
import { IoLogoSoundcloud } from "react-icons/io5";

export default function Home() {
  return (
    <div className="center">
      <main>
        <div className="flex flex-row justify-center gap-4 items-center py-6">
          <img
            src="/profile.jpg"
            className="w-20 h-20 rounded-full"
            alt="my profile pic"
          />
          <h1 className="text-center mb-2 font-bold align-middle">Dan Habot</h1>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3">
          <Card
            title="Email"
            color="red"
            icon={IoMdMail}
            label="dan.habot@gmail.com"
            link="mailto:dan.habot@gmail.com"
          />
          <Card
            title="Phone"
            color="sky"
            icon={IoMdPhonePortrait}
            label="+1 (201) 675-9961"
            link="tel:+12016759961"
          />
          <Card
            title="Contact info"
            color="amber"
            icon={IoMdKey}
            label="[Download]"
            link="/danhabot.vcf"
          />
          <Card
            title="LinkedIn"
            color="blue"
            icon={IoLogoLinkedin}
            label="danhabot"
            link="https://www.linkedin.com/in/danhabot/"
          />
          <Card
            title="Instagram"
            color="pink"
            icon={IoLogoInstagram}
            label="@danhab99"
            link="https://instagram.com/danhab99"
          />
          <Card
            title="Github"
            color="gray"
            icon={IoLogoGithub}
            label="danhab99"
            link="https://github.com/danhab99"
          />
          <Card
            title="Resume"
            color="emerald"
            icon={IoMdDocument}
            label="[Download]"
            link="/DanHabot-CV.pdf"
          />
          <Card
            color="purple"
            title="Blog"
            icon={IoIosPaper}
            label="-->"
            link="/blog"
          />
          <Card
            color="orange"
            title="SoundCloud"
            icon={IoLogoSoundcloud}
            label="[Link]"
            link="https://soundcloud.com/danhab99"
          />
        </div>
      </main>
    </div>
  );
}

type CardProps = {
  title: string;
  label: string;
  link: string;
  color: string;
  icon: IconType;
};

function Card(props: CardProps) {
  const Icon = props.icon;
  return (
    <a target="_blank" href={props.link}>
      <div
        className={`bg-gradient-to-br from-${props.color}-400 to-${props.color}-500 card`}
      >
        <div className="flex flex-row items-center">
          <div className="px-2">
            <IconContext.Provider
              value={{
                size: "4rem",
                className: `fill-zinc-100`,
              }}
            >
              <Icon />
            </IconContext.Provider>
          </div>
          <div className="pr-1">
            <h5 className="text-zink-500">{props.title}</h5>
            <h4>{props.label}</h4>
          </div>
        </div>
      </div>
    </a>
  );
}
