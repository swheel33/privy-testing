'use client'

import { useEffect, useState } from 'react'
import { configureChains } from 'wagmi'
import { goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { PrivyProvider } from '@privy-io/react-auth'
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector'

const chainConfig = configureChains(
    [goerli],
    [
        alchemyProvider({
            apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
        }),
        publicProvider(),
    ]
)

const privyId = process.env.NEXT_PUBLIC_PRIVY_ID as string

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <PrivyProvider
            appId={privyId}
            config={{
                appearance: { theme: 'dark' },
                fiatOnRamp: { useSandbox: true },
                embeddedWallets: { noPromptOnSignature: true },
            }}
        >
            <PrivyWagmiConnector wagmiChainsConfig={chainConfig}>
                {mounted && children}
            </PrivyWagmiConnector>
        </PrivyProvider>
    )
}
