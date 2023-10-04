'use client'

import Image from 'next/image'
import {
    useConnectWallet,
    useLogin,
    usePrivy,
    useWallets,
} from '@privy-io/react-auth'
import {
    Chain,
    mainnet,
    useAccount,
    useBalance,
    useDisconnect,
    useEnsName,
    useNetwork,
    useSwitchNetwork,
} from 'wagmi'

import { fromBigNumber, truncateAddress } from '@/lib/utils'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Close } from '@radix-ui/react-dialog'
import {
    ArrowRightFromLine,
    Check,
    Copy,
    DollarSign,
    KeyRound,
    LogIn,
    LogOut,
    ChevronDown,
    X,
} from 'lucide-react'

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'

import { formatNumber } from '@/lib/format'
import { useClipboard } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { defaultChain } from '@/lib/constants'
import { useStateStore } from '@/lib/state'

export const ConnectButton = () => {
    const { ready } = usePrivy()

    const { connectWallet } = useConnectWallet({
        onSuccess() {
            setIsConnected(true)
        },
    })

    const { login } = useLogin({
        onComplete() {
            setIsConnected(true)
        },
    })

    const { isConnected: isConnectedWagmi } = useAccount({
        onConnect() {
            setIsConnected(true)
        },
    })

    const { chain } = useNetwork()
    const { chains } = useSwitchNetwork()

    const { setIsConnected } = useStateStore()

    return (
        <>
            {ready && isConnectedWagmi ? (
                <div className="flex gap-6">
                    <Dialog>
                        <DialogTrigger>
                            {chain?.unsupported ? (
                                <div className="bg-red hover:bg-red">
                                    Unsupported Network
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Image
                                        alt={chain?.name ?? 'Chain icon'}
                                        src="/images/logos/ethereum.png"
                                        width={18}
                                        height={18}
                                    />

                                    <p className=" font-extralight">
                                        {chain?.name?.toUpperCase()}
                                    </p>
                                </div>
                            )}
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader className="flex justify-between">
                                <DialogTitle>Switch Networks</DialogTitle>
                                <Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Close>
                            </DialogHeader>
                            <div className="flex flex-col gap-1">
                                {chains.map((chain) => (
                                    <NetworkButton
                                        key={chain.name}
                                        chain={chain}
                                    />
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                    <AccountDetails />
                </div>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => connectWallet()} className="pr-1">
                        CONNECT WALLET
                    </button>
                    <HoverCard openDelay={0}>
                        <HoverCardTrigger className="flex items-center bg-[#005A76] group/chevron my-[-.25rem] mr-[-2rem] pr-2 rounded-r-3xl">
                            <ChevronDown
                                size={20}
                                className="relative top-[1px] ml-2 transition duration-200 group-hover/chevron:rotate-180"
                            />
                        </HoverCardTrigger>
                        <HoverCardContent className="border-0 bg-[#353535]/50 py-2 max-w-[215px] mr-6 md:mr-14 2xl:mr-16">
                            <button
                                onClick={() => login()}
                                className="flex gap-2"
                            >
                                <p className="font-extralight">
                                    LOGIN WITH SOCIAL
                                </p>
                                <LogIn size={20} />
                            </button>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            )}
        </>
    )
}

const NetworkButton = ({ chain }: { chain: Chain }) => {
    const { chain: activeChain } = useNetwork()
    const { switchNetwork } = useSwitchNetwork({
        throwForSwitchChainNotSupported: true,
    })
    const active = activeChain?.name === chain.name
    return (
        <button
            onClick={() => switchNetwork?.(chain.id)}
            className={`flex items-center justify-between rounded-sm p-2 ${
                active ? 'bg-primary' : 'hover:bg-white/10'
            }`}
        >
            <div className="flex gap-3 items-center">
                <Image
                    src={`/images/logos/ethereum.png`}
                    width={24}
                    height={24}
                    alt={chain.name}
                />
                <p className="font-normal text-lg">{chain.name}</p>
            </div>
            {active && (
                <div className="flex gap-2 items-center">
                    <p className="text-sm text-white/80">Connected</p>
                    <span className="bg-green rounded-[50%] h-2 w-2" />
                </div>
            )}
        </button>
    )
}

export const AccountDetails = () => {
    const { wallets } = useWallets()
    const { authenticated, exportWallet, user, setWalletPassword, logout } =
        usePrivy()

    const { address: walletAddress } = useAccount()
    const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === 'privy'
    )
    const { setIsConnected } = useStateStore()
    //Make sure embedded wallet always on correct chain
    useEffect(() => {
        const switchPrivyNetwork = async () => {
            if (embeddedWallet && authenticated) {
                await embeddedWallet.switchChain(defaultChain.id)
            }
        }
        switchPrivyNetwork()
    }, [authenticated, embeddedWallet])

    const alreadyHasPassword =
        user?.linkedAccounts.find(
            (account) =>
                account.type === 'wallet' &&
                account.walletClientType === 'privy'
            //@ts-ignore necessary since typing is wrong in the lib
        )?.recoveryMethod === 'user-passcode'

    const { data: ens } = useEnsName({
        address: walletAddress,
        chainId: mainnet.id,
    })
    const clipboard = useClipboard()
    const { disconnect } = useDisconnect({
        onSuccess() {
            setIsConnected(false)
        },
    })
    const { chain } = useNetwork()

    const { data: ethBalance } = useBalance({
        address: walletAddress,
        chainId: chain?.id ?? mainnet.id,
    })

    const [copyClicked, setCopyClicked] = useState(false)
    return (
        <Dialog>
            <DialogTrigger>
                <div>{ens || truncateAddress(walletAddress)}</div>
            </DialogTrigger>
            <DialogContent>
                <Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Close>
                <div className="flex flex-col items-center gap-4 font-medium">
                    <Image
                        src="/images/eye.png"
                        alt="eye"
                        height={100}
                        width={100}
                    />
                    <div className="flex flex-col gap-1 items-center">
                        <p className="text-xl font-extrabold">
                            {ens || truncateAddress(walletAddress)}
                        </p>
                        <p className="text-white/80">
                            {formatNumber(fromBigNumber(ethBalance?.value))} ETH
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            className="border-0 hover:bg-white/40 hover:scale-105 ease-in-out transition duration-300"
                            onClick={() => {
                                clipboard.copy(walletAddress)
                                setCopyClicked(true)
                            }}
                        >
                            <div className="flex flex-col items-center gap-1 py-1">
                                {!copyClicked ? (
                                    <Copy size={20} />
                                ) : (
                                    <Check size={20} />
                                )}
                                <p>
                                    {!copyClicked ? 'Copy Address' : 'Copied'}
                                </p>
                            </div>
                        </button>
                        <button
                            className="border-0 hover:bg-white/40 hover:scale-105 ease-in-out transition duration-300"
                            onClick={() => {
                                if (embeddedWallet) {
                                    logout()
                                }
                                disconnect()
                            }}
                        >
                            <div className="flex flex-col items-center gap-1 py-1">
                                <LogOut size={20} />
                                <p>Disconnect</p>
                            </div>
                        </button>
                        {authenticated && (
                            <>
                                <Close>
                                    <button
                                        className="border-0 hover:bg-white/40 hover:scale-105 ease-in-out transition duration-300"
                                        onClick={() => exportWallet()}
                                    >
                                        <div className="flex flex-col items-center gap-1 py-1">
                                            <ArrowRightFromLine size={20} />
                                            <p>Export Wallet</p>
                                        </div>
                                    </button>
                                </Close>

                                <Close>
                                    <button
                                        className="border-0 hover:bg-white/40 hover:scale-105 ease-in-out transition duration-300"
                                        onClick={async () =>
                                            await embeddedWallet?.fund({
                                                config: {
                                                    uiConfig: {
                                                        theme: 'dark',
                                                    },
                                                    currencyCode:
                                                        'ETH_ETHEREUM',
                                                },
                                            })
                                        }
                                    >
                                        <div className="flex flex-col items-center gap-1 py-1">
                                            <DollarSign size={20} />
                                            <p>Fund Wallet</p>
                                        </div>
                                    </button>
                                </Close>
                            </>
                        )}
                    </div>
                    {!alreadyHasPassword && authenticated && (
                        <div className="flex justify-center">
                            <Close>
                                <button
                                    className="border-0 hover:bg-white/40 hover:scale-105 ease-in-out transition duration-300"
                                    onClick={() => setWalletPassword()}
                                >
                                    <div className="flex flex-col items-center gap-1 py-1">
                                        <KeyRound size={20} />
                                        <p>Set Wallet Password</p>
                                    </div>
                                </button>
                            </Close>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
