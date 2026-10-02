import { Pressable, Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { Typography } from '../atoms/Typography'
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
        {pageList(page, pages).map((p, i) => {
          const current = p === page
          return (
            <Pressable
              // biome-ignore lint/suspicious/noArrayIndexKey: « … » peut apparaître deux fois
              key={i}
              disabled={p === '…'}
              onPress={() => typeof p === 'number' && onChange(p)}
              aria-current={current ? 'page' : undefined}
              aria-label={typeof p === 'number' ? `Page ${p}` : undefined}
              style={{
                minWidth: 32,
                height: 32,
                borderWidth: p === '…' ? 0 : border.thin,
                borderColor: colors.ink,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: current ? colors.ink : colors.white,
              }}
            >
              <Text style={[mono, { color: current ? colors.white : colors.ink }]}>{p}</Text>
            </Pressable>
          )
        })}
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
