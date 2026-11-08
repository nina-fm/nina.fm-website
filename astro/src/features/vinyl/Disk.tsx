import Sharp from './Sharp.tsx'
import Sticker from './Sticker.tsx'

interface Props {
  title?: string
  artist?: string
  spinning: boolean
}

/** Le disque (`Disk.vue`), 1000 px du canevas : le sticker tourne pendant l'écoute. */
export default function Disk(props: Props) {
  return (
    <div class="relative size-[1000px]">
      <div class="absolute-center bg-secondary aspect-square size-full rounded-full" />
      <div class="absolute-center flex flex-col items-center justify-center">
        <Sticker
          title={props.title}
          artist={props.artist}
          class={`size-[300px] ${props.spinning ? 'animate-spin-slow' : ''}`}
        />
        <Sharp size={30} class="absolute-center" />
      </div>
    </div>
  )
}
