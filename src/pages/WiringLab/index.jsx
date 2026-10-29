import { Navigate, useParams } from 'react-router-dom'
import { GraduationCap, Cable } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import LabTabs from '@components/common/LabTabs'
import useDocumentMeta from '@lib/useDocumentMeta'
import Simulator from '@pages/Simulator'
import WiringBuilder from '@pages/WiringBuilder'
import styles from './WiringLab.module.css'

// Two tools on one page: guided lessons on the bench, and a free wiring builder for practice.
const TABS = {
  lessons: {
    to: '/wiring-lab/lessons',
    text: 'Lessons',
    icon: GraduationCap,
    title: 'Wiring Lessons | EGIRE Robotics',
    description: 'Practise soldering an FPV drone on a realistic bench: ESC, flight controller, motors, receiver, camera and VTX, with lessons and your own workspaces.',
    View: Simulator,
  },
  practice: {
    to: '/wiring-lab/practice',
    text: 'Practice builder',
    icon: Cable,
    title: 'Wiring Builder | EGIRE Robotics',
    description: 'Build an FPV drone wiring diagram: add real parts, solder wires pad to pad, and see what is connected, what is missing and what would burn.',
    View: WiringBuilder,
  },
}

export default function WiringLab() {
  const { tab = 'lessons' } = useParams()
  const current = TABS[tab]
  useDocumentMeta(current?.title ?? TABS.lessons.title, current?.description)
  if (!current) return <Navigate to="/wiring-lab" replace />
  const { View } = current
  return (
    <PageWrapper fullHeight hideFooter>
      <div className={styles.lab}>
        <LabTabs label="Wiring lab" tabs={Object.values(TABS)} />
        <View embedded />
      </div>
    </PageWrapper>
  )
}
