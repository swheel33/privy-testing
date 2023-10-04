import { ConnectButton } from '@/components/ConnectButton'
import { Testing } from '@/components/Testing'

export default function Home() {
    return (
        <div className="flex flex-col gap-3 p-5">
            <ConnectButton />
            <Testing />
        </div>
    )
}
