import { Catalogue } from '@kwatro/design-system/catalogue'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  return <Catalogue />
}
