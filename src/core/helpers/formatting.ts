import { MessageEntity, User } from 'typegram'

export interface FmtString {
  text: string
  entities?: MessageEntity[]
  parse_mode?: undefined
}

export class FmtString implements FmtString {
  constructor(public text: string, public entities?: MessageEntity[]) {
    // force parse_mode to undefined if entities are present
    if (entities) this.parse_mode = undefined
  }
  static normalise(content: string | FmtString) {
    if (typeof content === 'string') return new FmtString(content)
    return content
  }
  toString() {
    return this.text
  }
}

export namespace Types {
  // prettier-ignore
  export type Containers = 'bold' | 'italic' | 'spoiler' | 'strikethrough' | 'underline'
  export type NonContainers = 'code' | 'pre'
  export type Text = Containers | NonContainers
}

type TemplateParts = string | TemplateStringsArray | string[]

export function _fmt(
  kind: Types.Containers | 'very-plain'
): (parts: TemplateParts, ...items: (string | FmtString)[]) => FmtString
export function _fmt(
  kind: Types.NonContainers
): (parts: TemplateParts, ...items: string[]) => FmtString
export function _fmt(
  kind: 'pre',
  opts: { language: string }
): (parts: TemplateParts, ...items: string[]) => FmtString
export function _fmt(kind: Types.Text | 'very-plain', opts?: object) {
  return function fmt(parts: TemplateParts, ...items: (string | FmtString)[]) {
    let text = ''
    const entities: MessageEntity[] = []
    parts = typeof parts === 'string' ? [parts] : parts
    for (let i = 0; i < parts.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      text += parts[i]!
      const item = items[i]
      if (!item) continue
      if (typeof item === 'string') {
        text += item
        continue
      }
      for (const child of item.entities || [])
        entities.push({ ...child, offset: text.length + child.offset })
      text += item.text
    }
    if (kind !== 'very-plain')
      entities.unshift({ type: kind, offset: 0, length: text.length, ...opts })
    return new FmtString(text, entities.length ? entities : undefined)
  }
}
export const linkOrMention = (
  content: string | FmtString,
  data:
    | { type: 'text_link'; url: string }
    | { type: 'text_mention'; user: User }
) => {
  const text = content.toString()
  const entities = FmtString.normalise(content).entities || []
  entities.unshift(Object.assign(data, { offset: 0, length: text.length }))
  return new FmtString(text, entities)
}
