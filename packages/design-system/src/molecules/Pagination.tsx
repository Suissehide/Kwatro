import { Pressable, Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font } from '../tokens'

import { pageList } from './pageList'

const mono = { ...font('mono', 700), fontSize: 13 }

export function Pagination({
  page,
  pages,
  total,
  perPage,
  onChange,
}: {
  page: number
  pages: number
  total: number
  perPage: number
  onChange: (p: number) => void
}) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(total, page * perPage)
  return (
    <View
      role="navigation"
      aria-label="Pagination"
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
      }}
    >
      <Typography variant="label">
        {from}–{to} sur {total}
      </Typography>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <IconButton
          size={32}
          label="Page précédente"
          icon={<Text style={mono}>‹</Text>}
          onPress={() => onChange(Math.max(1, page - 1))}
        />
        {pageList(page, pages).map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: « … » peut apparaître deux fois
          <PageButton key={i} p={p} current={p === page} onChange={onChange} />
        ))}
        <IconButton
          size={32}
          label="Page suivante"
          icon={<Text style={mono}>›</Text>}
          onPress={() => onChange(Math.min(pages, page + 1))}
        />
      </View>
    </View>
  )
}

function PageButton({
  p,
  current,
  onChange,
}: {
  p: number | '…'
  current: boolean
  onChange: (p: number) => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      disabled={p === '…'}
      onPress={() => typeof p === 'number' && onChange(p)}
      aria-current={current ? 'page' : undefined}
      aria-label={typeof p === 'number' ? `Page ${p}` : undefined}
      {...hoverProps}
      style={{
        minWidth: 32,
        height: 32,
        borderWidth: p === '…' ? 0 : border.thin,
        borderColor: colors.ink,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: current ? colors.ink : hovered && p !== '…' ? colors.hover : colors.white,
      }}
    >
      <Text style={[mono, { color: current ? colors.white : colors.ink }]}>{p}</Text>
    </Pressable>
  )
}
