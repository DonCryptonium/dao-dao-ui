import { EmojiHappyIcon, HandIcon } from '@heroicons/react/outline'
import Image from 'next/image'
import { FC } from 'react'
import toast from 'react-hot-toast'

import { Discord, Github, Twitter } from '@dao-dao/icons'
import { Vote } from '@dao-dao/ui'

export interface HomepageCardsProps {}

export const HomepageCards: FC<HomepageCardsProps> = () => (
  <div className="flex flex-col gap-6 mx-2 max-w-[1044px]">
    <div className="flex flex-wrap gap-6 justify-center">
      <div className="flex flex-col gap-8 p-6 bg-card rounded md:py-14 md:px-12">
        <div className="flex justify-center items-center p-2 w-fit h-fit bg-primary rounded">
          <HandIcon className="w-3" />
        </div>
        <h3 className="header-text">Propose & Vote</h3>
        <div className="xl:-ml-24">
          <Vote
            blur={true}
            loading={false}
            onVote={() =>
              toast.success(
                'Think this is neat? You should try the real thing! :)'
              )
            }
            voterWeight={7}
          />
        </div>
      </div>
      <div
        className="flex relative flex-col grow gap-8 py-14 px-12 bg-card rounded"
        style={{
          backgroundImage:
            'linear-gradient(270.19deg, #8F74FA -29.85%, #413B6B 16.35%, #333051 34.43%, #262738 56.36%, #191D20 99.87%)',
        }}
      >
        <div className="flex justify-center items-center p-2 w-fit h-fit bg-primary rounded">
          <EmojiHappyIcon className="w-3" />
        </div>
        <div className="hidden absolute top-0 right-0 bottom-0 my-6 w-full md:block">
          <Image
            alt=""
            layout="fill"
            objectFit="contain"
            objectPosition="right center"
            src="/proposal-list-homepage.png"
            style={{
              opacity: '0.75',
            }}
          />
        </div>

        <h3 className="header-text">Easy-to-use interface</h3>
        <div className="flex flex-col gap-3 max-w-xs">
          <p className="max-w-sm body-text">
            Anyone from your community can be a full participant.
          </p>
          <p className="max-w-sm body-text">
            No more command line wrangling just to vote on a proposal. DAO
            DAO&apos;s visual UI makes collective ownership accessible to
            everyone.
          </p>
        </div>
      </div>
    </div>
    <div
      className="relative p-6 bg-card rounded md:py-14 md:px-12"
      style={{
        backgroundImage:
          'linear-gradient(270deg, #8F74FA -18.38%, #413B6B 9.63%, #333051 20.61%, #262738 33.92%, #191D20 60.34%)',
      }}
    >
      <div className="flex gap-1 items-center">
        <a
          className="z-10 p-1 hover:text-primary bg-primary rounded transition"
          href="https://github.com/DA0-DA0"
          rel="noreferrer"
          target="_blank"
        >
          <Github fill="currentColor" height="20px" width="20px" />
        </a>
        <a
          className="z-10 p-1 hover:text-primary bg-primary rounded transition"
          href="https://twitter.com/da0_da0"
          rel="noreferrer"
          target="_blank"
        >
          <Twitter fill="currentColor" height="20px" width="20px" />
        </a>
        <a
          className="z-10 p-1 hover:text-primary bg-primary rounded transition"
          href="https://discord.gg/sAaGuyW3D2"
          rel="noreferrer"
          target="_blank"
        >
          <Discord fill="currentColor" height="20px" width="20px" />
        </a>
      </div>
      <h3 className="mt-8 header-text">Join the community</h3>
      <div className="absolute top-0 right-0 bottom-0 w-full">
        <Image
          alt=""
          layout="fill"
          objectFit="contain"
          objectPosition="right center"
          src="/socials-card-background.png"
          style={{
            opacity: '0.5',
          }}
        />
      </div>
    </div>
  </div>
)
