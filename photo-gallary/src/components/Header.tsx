import Link from 'next/link'
import { Button } from './ui/button'

export function Header() {
    return (
        <header className='sticky top-0 z-30 shadow-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 backdrop-blur border-b'>
            <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                <div>
                    <Link
                        href='/'
                        className='text-xl font-bold block text-gray-800'
                    >
                        Photo Gallery
                    </Link>
                    <div className='text-sm text-gray-500 font-normal mt-1 ml-1'>
                        あなたの思い出を美しく保存
                    </div>
                </div>
                <nav className='flex items-center gap-2 ml-8'>
                    <Button
                        variant='ghost'
                        asChild
                        className='text-gray-700 hover:bg-gray-300/40'
                    >
                        <Link href='/'>Home</Link>
                    </Button>
                    <Button
                        variant='ghost'
                        asChild
                        className='text-gray-700 hover:bg-gray-300/40'
                    >
                        <Link href='/add'>写真追加</Link>
                    </Button>
                    <Button
                        variant='ghost'
                        asChild
                        className='text-gray-700 hover:bg-gray-300/40'
                    >
                        <Link href='/search'>写真検索</Link>
                    </Button>
                </nav>
            </div>
        </header>
    )
}
