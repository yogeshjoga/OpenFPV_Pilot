import { Navigate, useParams } from 'react-router-dom'
import { Box, SlidersHorizontal } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import LabTabs from '@components/common/LabTabs'
import useDocumentMeta from '@lib/useDocumentMeta'
import DroneLesson from '@pages/DroneLesson'
import DroneConfigurator from '@pages/DroneConfigurator'

// Two tools on one page: learn how a drone works, then build and test your own.
const TABS = {
  'how-it-works': {
    to: '/drone-lab/how-it-works',
    text: 'How it works',
    icon: Box,
    title: 'How a Drone Works | EGIRE Robotics',
    description: 'Build an FPV drone part by part, learn the radio sticks, fly it, and explore the physics lab with live charts.',
    View: DroneLesson,
  },
  configurator: {
    to: '/drone-lab/configurator',
    text: 'Configurator',
    icon: SlidersHorizontal,
    title: 'Drone Configurator | EGIRE Robotics',
    description: 'Pick the motors, propellers, battery and video system for a 5-inch freestyle drone and see how it would fly.',
    View: DroneConfigurator,
  },
}

export default function DroneLab() {
  const { tab = 'how-it-works' } = useParams()
  const current = TABS[tab]
  useDocumentMeta(current?.title ?? TABS['how-it-works'].title, current?.description)
  if (!current) return <Navigate to="/drone-lab" replace />
  const { View } = current
  return (
    <PageWrapper>
      <LabTabs label="Drone lab" tabs={Object.values(TABS)} />
      <View embedded />
    </PageWrapper>
  )
}
