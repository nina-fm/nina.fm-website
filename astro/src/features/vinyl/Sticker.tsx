import LogoStroke from '~/shared/ui/LogoStroke.tsx'

interface Props {
  title?: string
  artist?: string
  class?: string
}

/** L'étiquette du disque (`Sticker.vue`) : le logo, puis ce qui passe à l'antenne. */
export default function Sticker(props: Props) {
  return (
    <div
      class={`bg-primary text-primary-foreground flex aspect-square flex-col gap-0 rounded-full ${props.class ?? ''}`}
    >
      <div class="flex h-1/2 w-full flex-col items-center justify-end bg-transparent pb-6 text-current">
        <div class="w-36">
          <LogoStroke class="vinyl-logo w-full" />
        </div>
      </div>
      <div class="flex h-1/2 w-full flex-col items-center justify-start bg-transparent px-8 pt-6 text-current">
        <div class="flex flex-col items-center">
          <div class="text-center text-lg leading-5 font-bold">{props.title ?? ''}</div>
          <div class="text-xs">{props.artist ?? ''}</div>
        </div>
      </div>
    </div>
  )
}
