import { FunctionComponent } from 'react'

import { GetStaticProps, NextPage } from 'next'

import fs from 'fs'
import path from 'path'

import { MarkdownPreview } from '@dao-dao/ui'

import {
  HeroContent,
  Loader,
  makeGetStaticProps,
  PageWrapper,
  PageWrapperProps,
  SuspenseLoader,
  ProposalsContent,
  Hero,
} from '@/components'
import { HeroContentLoader } from '@/components/governance/HeroContent'
import { ProposalsInfo } from '@/components/governance/ProposalsInfo'

interface InnerGovernanceProps {
  missionMarkdown: string
}

const InnerGovernance: FunctionComponent<InnerGovernanceProps> = ({
  missionMarkdown,
}) => (
  <section className="p-8 mx-auto space-y-8 max-w-[1118px]">
    <Hero>
      <SuspenseLoader fallback={<HeroContentLoader />}>
        <HeroContent />
      </SuspenseLoader>
    </Hero>

    <div className="p-8 max-w-none bg-disabled rounded-lg">
      <MarkdownPreview
        className="prose-h2:mb-6 prose-h3:mb-4 max-w-full body-text prose-h2:header-text prose-h3:title-text"
        markdown={missionMarkdown}
      />
    </div>

    <div className="space-y-4">
      <h3 className="title-text">Proposals</h3>
      <ProposalsInfo />

      <SuspenseLoader fallback={<Loader />}>
        <ProposalsContent />
      </SuspenseLoader>
    </div>
  </section>
)

type GovernancePageProps = PageWrapperProps & {
  innerProps: InnerGovernanceProps
}

const GovernancePage: NextPage<GovernancePageProps> = ({
  children: _,
  innerProps,
  ...props
}) => (
  <PageWrapper {...props}>
    <InnerGovernance {...innerProps} />
  </PageWrapper>
)

export default GovernancePage

export const getStaticProps: GetStaticProps<GovernancePageProps> = async (
  ...props
) => {
  const [staticProps, missionMarkdown] = await Promise.all([
    // Get normal props for DAO info.
    makeGetStaticProps()(...props),
    // Read contents of markdown file.
    fs.promises.readFile(path.join(process.cwd(), 'mission.md'), {
      encoding: 'utf8',
    }),
  ])

  if (!('props' in staticProps)) {
    return staticProps
  }

  return {
    ...staticProps,
    props: {
      ...staticProps.props,
      innerProps: {
        missionMarkdown,
      },
    },
  }
}
