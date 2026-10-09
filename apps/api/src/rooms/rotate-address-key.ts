import { PrismaPg } from '@prisma/adapter-pg'
import { loadEnv } from '../config/env'
import { PrismaClient } from '../generated/prisma/client'
import { addressKeys, openAddress, sealAddress } from './home.rules'

/**
 * Secours en cas de fuite d'une clé d'adresse : re-chiffre tout de suite avec la clé active (en tête de
 * `HOME_ADDRESS_KEYS`) les adresses encore chiffrées avec une autre clé, qui peut ensuite être retirée.
 * Dev : `pnpm --filter @lucko/api address-keys:rotate` ; conteneur : `node dist/rooms/rotate-address-key.js`.
 */
async function main() {
  const env = loadEnv()
  const keys = addressKeys(env.HOME_ADDRESS_KEYS)
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) })
  try {
    const stale = await prisma.roomPrivateAddress.findMany({
      where: { keyVersion: { not: keys.active } },
    })
    for (const row of stale)
      await prisma.roomPrivateAddress.update({
        where: { roomId: row.roomId },
        data: sealAddress(keys, openAddress(keys, row)),
      })
    const retired = [...keys.keys.keys()].filter((v) => v !== keys.active)
    console.log(
      `${stale.length} adresse(s) re-chiffrée(s) avec la clé ${keys.active}.` +
        (retired.length ? ` Tu peux retirer de HOME_ADDRESS_KEYS : ${retired.join(', ')}.` : ''),
    )
  } finally {
    await prisma.$disconnect()
  }
}

void main()
