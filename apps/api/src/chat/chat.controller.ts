import {
  CHAT_TYPES,
  type ChatRef,
  chatMessageSchema,
  chatPageQuerySchema,
  chatPageSchema,
  muteChatSchema,
  myChatsSchema,
  reportSchema,
  sendMessageSchema,
} from '@kwatro/shared'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ApiNoContentResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import type { z } from 'zod'
import { CurrentUser } from '../auth/auth.decorators'
import { ZodBody, ZodQuery, ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { ChatService } from './chat.service'

/** `/chats/room/<id>` ou `/chats/event/<id>` : le chat de la room ou de l'événement. */
function chatRef(type: string, id: string): ChatRef {
  if (!(CHAT_TYPES as readonly string[]).includes(type))
    throw new NotFoundException('Conversation introuvable')
  return { type: type as ChatRef['type'], id }
}

const typeParam = ApiParam({ name: 'type', enum: CHAT_TYPES })

/** Chat de room et de tournoi (KWT-80). Réservé aux membres : 404 pour les autres. */
@ApiTags('chat')
@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('me/chats')
  @ZodResponse(myChatsSchema)
  chats(@CurrentUser() user: User) {
    return this.chat.chats(user)
  }

  @Get('chats/:type/:id/messages')
  @typeParam
  @ZodResponse(chatPageSchema)
  page(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @ZodQuery(chatPageQuerySchema) { cursor }: z.output<typeof chatPageQuerySchema>,
  ) {
    return this.chat.page(chatRef(type, id), user, cursor)
  }

  /** 400 si un mot est interdit, 403 pour une annonce d'un simple joueur, 429 en cas de flood. */
  @Post('chats/:type/:id/messages')
  @typeParam
  @ZodResponse(chatMessageSchema, 201)
  send(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @ZodBody(sendMessageSchema) body: z.output<typeof sendMessageSchema>,
  ) {
    return this.chat.send(chatRef(type, id), user, body)
  }

  @Delete('chats/:type/:id/messages/:messageId')
  @typeParam
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @Param('type') type: string,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
  ) {
    return this.chat.remove(chatRef(type, id), user, messageId)
  }

  @Post('chats/:type/:id/messages/:messageId/report')
  @typeParam
  @HttpCode(204)
  @ApiNoContentResponse()
  report(
    @Param('type') type: string,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
    @ZodBody(reportSchema) body: z.output<typeof reportSchema>,
  ) {
    return this.chat.report(chatRef(type, id), user, messageId, body)
  }

  @Put('chats/:type/:id/read')
  @typeParam
  @HttpCode(204)
  @ApiNoContentResponse()
  read(@Param('type') type: string, @Param('id') id: string, @CurrentUser() user: User) {
    return this.chat.markRead(chatRef(type, id), user)
  }

  @Put('chats/:type/:id/mute')
  @typeParam
  @HttpCode(204)
  @ApiNoContentResponse()
  mute(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @ZodBody(muteChatSchema) { muted }: z.output<typeof muteChatSchema>,
  ) {
    return this.chat.mute(chatRef(type, id), user, muted)
  }
}
