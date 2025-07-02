import Link from 'next/link'
import { Button } from './ui/button'
import { 
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from './ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
// Import package.json to get version information
import packageInfo from '../../package.json'

export function Header({ onAddPhotoClick, onToggleFolderMenu, onAddFolderClick }: { onAddPhotoClick?: () => void, onToggleFolderMenu?: () => void, onAddFolderClick?: () => void }) {
    return (
        <header className='sticky top-0 z-30 shadow-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 backdrop-blur border-b'>
            <div className='container mx-auto px-4 py-4 flex flex-col md:flex-row items-center md:justify-between gap-2'>
                <div className='flex flex-col items-center md:items-start'>
                    <Link
                        href='/'
                        className='text-xl font-bold block text-gray-800'
                    >
                        Photo Gallery
                    </Link>
                    <div className='text-sm text-gray-500 font-normal mt-1 text-center md:text-left'>
                        あなたの思い出を美しく保存
                    </div>
                </div>
                <nav className='flex items-center gap-2 justify-center w-full md:w-auto mt-2 md:mt-0'>
                    <Button
                        variant='ghost'
                        asChild
                        className='text-gray-700 hover:bg-gray-300/40'
                    >
                        <Link href='/'>Home</Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='text-gray-700 hover:bg-gray-300/40 flex items-center gap-1'>
                                写真メニュー
                                <ChevronDown className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={onAddPhotoClick}>
                                写真追加
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onAddFolderClick}>
                                写真フォルダ追加
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/search'>写真検索</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant='ghost'
                        className='text-gray-700 hover:bg-gray-300/40'
                        onClick={onToggleFolderMenu}
                    >
                        フォルダ一覧 <span className="text-xs text-gray-500 ml-1">v{packageInfo.version}</span>
                    </Button>
                </nav>
            </div>
        </header>
    )
}
