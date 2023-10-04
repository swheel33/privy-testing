'use client'

import { useStateStore } from '@/lib/state'
import { useAccount } from 'wagmi'

export const Testing = () => {
    const { isConnected, isConnecting } = useAccount()
    return (
        <div className="flex flex-col gap-3">
            <p>isConnected: {isConnected ? 'true' : 'false'}</p>
            <p>isConnecting: {isConnecting ? 'true' : 'false'}</p>
        </div>
    )
}
