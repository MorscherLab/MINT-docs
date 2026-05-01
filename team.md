---
layout: page
title: Team
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection,
} from 'vitepress/theme'

// To add a member: { avatar, name, title, desc?, links: [{ icon, link }] }
// `icon` accepts 'github' | 'twitter' | 'linkedin' | 'mastodon' | 'instagram' | 'discord' | 'youtube' | 'slack',
// or { svg: '<svg ...>' } for anything else (e.g. ORCID, lab homepage).
// Avatars use ui-avatars.com fallbacks; replace with real photo URLs when available.
const core = [
  {
    avatar: 'https://ui-avatars.com/api/?name=Raphael+Morscher&background=4F46E5&color=fff&size=256&font-size=0.4',
    name: 'Raphael Morscher',
    title: 'Principal Investigator, Universitäts-Kinderspital Zürich',
    links: [
      { icon: 'github', link: 'https://github.com/MorscherLab' },
    ],
  },
  {
    avatar: 'https://github.com/EstrellaXD.png',
    name: 'Xingyu Pan',
    title: 'Universitäts-Kinderspital Zürich',
    links: [
      { icon: 'github', link: 'https://github.com/EstrellaXD' },
    ],
  },
]

const contributors = [
  // Add open-source contributors here, e.g.
  // {
  //   avatar: 'https://github.com/<user>.png',
  //   name: 'Jane Doe',
  //   title: 'Plugin marketplace, RBAC',
  //   links: [{ icon: 'github', link: 'https://github.com/<user>' }],
  // },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>The team behind MINT</template>
    <template #lead>
      MINT is developed and maintained by the Morscher Lab at
      Universitäts-Kinderspital Zürich, with contributions from researchers
      and engineers using the platform in their own labs.
    </template>
  </VPTeamPageTitle>

  <VPTeamMembers size="medium" :members="core" />

  <VPTeamPageSection v-if="contributors.length">
    <template #title>Contributors</template>
    <template #lead>
      Researchers and engineers who've shipped features, fixes, or feedback that
      shaped MINT.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="contributors" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
