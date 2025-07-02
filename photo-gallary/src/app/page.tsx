'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Photo,
    getPhotos,
    createPhoto,
    createMultiplePhotos,
    updatePhoto,
    deletePhoto,
    getFolders,
} from '@/lib/photoService'
import Image from 'next/image'

// MinIOのベースURL（環境変数から取得）
const MINIO_BASE_URL = `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || 'http://localhost:9000'}/photos`
// const MINIO_BASE_URL = 'http://localhost:64131/photos'
function getPhotoUrl(fileName: string, folder?: string) {
    // console.log('MINIO_PUBLIC_URL:', process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL)
    // console.log('fileName:', fileName)

    if (!fileName) return ''

    // If the URL is already a full URL, extract just the path part after the domain
    if (fileName.startsWith('http')) {
        try {
            const url = new URL(fileName)

            console.log('url:', url)
            console.log('url.pathname:', url.pathname)

            return url.pathname
        } catch (e) {
            console.error('Invalid URL:', fileName, e)
            return fileName
        }
    }

    const folderPath = folder ? `/${encodeURIComponent(folder)}` : ''
    const encodedFileName = encodeURIComponent(fileName)
    return `${MINIO_BASE_URL}${folderPath}/${encodedFileName}`
}

function PhotoForm({
    initial,
    onSave,
    onCancel,
    submitLabel = '保存',
    photos = [],
    currentFolder = '',
    isEditMode = false,
}: {
    initial: { title: string; description: string; url: string }
    onSave: (
        data: {
            title: string
            description: string
            url: string
            folder: string
        },
        files?: File[]
    ) => void
    onCancel: () => void
    submitLabel?: string
    photos?: Photo[]
    currentFolder?: string
    isEditMode?: boolean
}) {
    const [form, setForm] = useState({ ...initial, folder: currentFolder })
    const [fileName, setFileName] = useState('選択されていません')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [newFolder, setNewFolder] = useState('')

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            // Store all selected files
            const fileArray = Array.from(files)
            setSelectedFiles(fileArray)

            // For preview, use the first file
            const firstFile = files[0]
            const url = URL.createObjectURL(firstFile)
            setForm((prev) => ({ ...prev, url }))

            // Update file name display
            if (files.length === 1) {
                setFileName(files[0].name)
            } else {
                setFileName(`${files.length}枚の写真が選択されました`)
            }
        } else {
            setSelectedFiles([])
            setFileName('選択されていません')
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // If in add mode and newFolder is provided, use it as the folder
        // Otherwise, use empty string (which means "all folders")
        const folderValue = !isEditMode ? newFolder : form.folder
        onSave(
            { ...form, folder: folderValue },
            selectedFiles.length > 0 ? selectedFiles : undefined
        )
    }

    return (
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            {form.url && (
                <Image
                    src={getPhotoUrl(form.url, form.folder)}
                    alt='preview'
                    width={400}
                    height={300}
                    className='w-full max-h-[40vh] object-contain rounded mb-2 mx-auto'
                />
            )}
            <label className='flex flex-col gap-1'>
                <span className='mb-1'>写真アップロード</span>
                <div className='flex items-center gap-2 w-full justify-start'>
                    <span className='relative inline-block bg-gray-100 border rounded px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors text-gray-800 font-medium w-1/4 min-w-[60px] text-center text-xs whitespace-nowrap'>
                        ファイルを選択
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                            style={{ left: 0, top: 0 }}
                            {...(photos.length === 0
                                ? { webkitdirectory: '', directory: '' }
                                : {})}
                            multiple
                        />
                    </span>
                    <span className='text-gray-600 text-sm break-all'>
                        {fileName}
                    </span>
                </div>
            </label>
            <label className='flex flex-col gap-1'>
                <span>タイトル</span>
                <input
                    name='title'
                    value={form.title}
                    onChange={handleChange}
                    className='border rounded px-2 py-1'
                />
            </label>
            <label className='flex flex-col gap-1'>
                <span>説明</span>
                <textarea
                    name='description'
                    value={form.description}
                    onChange={handleChange}
                    className='border rounded px-2 py-1'
                />
            </label>

            {!isEditMode && (
                <label className='flex flex-col gap-1'>
                    <span>フォルダ名</span>
                    <input
                        name='newFolder'
                        value={newFolder}
                        onChange={(e) => setNewFolder(e.target.value)}
                        className='border rounded px-2 py-1'
                        placeholder='フォルダ名'
                    />
                </label>
            )}
            <DialogFooter>
                <Button type='submit'>{submitLabel}</Button>
                <DialogClose asChild>
                    <Button
                        type='button'
                        variant='secondary'
                        onClick={onCancel}
                    >
                        キャンセル
                    </Button>
                </DialogClose>
            </DialogFooter>
        </form>
    )
}

export default function Home() {
    const [photos, setPhotos] = useState<Photo[]>([])
    const [folders, setFolders] = useState<string[]>([])
    const [currentFolder, setCurrentFolder] = useState<string>('')
    const [showFolderMenu, setShowFolderMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editPhoto, setEditPhoto] = useState<Photo | null>(null)
    const [editData, setEditData] = useState<{
        title: string
        description: string
        url: string
    }>({ title: '', description: '', url: '' })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isFolderUploadDialogOpen, setIsFolderUploadDialogOpen] =
        useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch folders when component mounts
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                console.log('Fetching folders...')
                const folderList = await getFolders()
                console.log('Folders fetched:', folderList)
                setFolders(folderList)
            } catch (err) {
                console.error('Failed to fetch folders:', err)
                // Don't set error here, as we'll still try to fetch photos
            }
        }

        fetchFolders()
    }, [])

    // Fetch photos when component mounts or current folder changes
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getPhotos(currentFolder)
                setPhotos(data)
                console.info('fetchPhots: ' + data.length)
            } catch (err) {
                console.error('Failed to fetch photos:', err)
                setError(
                    '写真の読み込みに失敗しました。後でもう一度お試しください。'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchPhotos()
    }, [currentFolder])

    // Handle click outside to close the folder menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowFolderMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleEditClick = (photo: Photo) => {
        setEditPhoto(photo)
        setEditData({
            title: photo.title,
            description: photo.description,
            url: photo.url,
        })
        setIsDialogOpen(true)
    }

    const handleEditSave = async (data: {
        title: string
        description: string
        url: string
        folder: string
    }) => {
        if (!editPhoto) return

        try {
            setIsSubmitting(true)

            // Create a file from the URL if it's a Blob URL (new file uploaded)
            let file: File | undefined
            if (data.url.startsWith('blob:')) {
                const response = await fetch(data.url)
                const blob = await response.blob()
                file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
            }

            const updatedPhoto = await updatePhoto(editPhoto.id, {
                title: data.title,
                description: data.description,
                folder: data.folder,
                file,
            })

            // Refresh folders list if a new folder was created
            if (data.folder && !folders.includes(data.folder)) {
                const updatedFolders = await getFolders()
                setFolders(updatedFolders)
            }

            setPhotos(
                photos.map((p) => (p.id === editPhoto.id ? updatedPhoto : p))
            )
            setIsDialogOpen(false)
        } catch (err) {
            console.error('Failed to update photo:', err)
            alert('写真の更新に失敗しました。後でもう一度お試しください。')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('この写真を削除してもよろしいですか？')) return

        try {
            setIsSubmitting(true)
            await deletePhoto(id)
            setPhotos(photos.filter((p) => p.id !== id))
        } catch (err) {
            console.error('Failed to delete photo:', err)
            alert('写真の削除に失敗しました。後でもう一度お試しください。')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddPhoto = async (
        data: {
            title: string
            description: string
            url: string
            folder: string
        },
        files?: File[]
    ) => {
        try {
            setIsSubmitting(true)

            // Handle multiple files upload
            if (files && files.length > 0) {
                // Upload multiple files
                const newPhotos = await createMultiplePhotos(
                    files,
                    data.title || '写真',
                    data.description || '',
                    data.folder
                )

                // Refresh folders list if a new folder was created
                if (data.folder && !folders.includes(data.folder)) {
                    const updatedFolders = await getFolders()
                    setFolders(updatedFolders)
                }

                setPhotos([...newPhotos, ...photos])
                setIsAddDialogOpen(false)
                return
            }

            // Single file upload (original behavior)
            let file: File | undefined
            if (data.url) {
                const response = await fetch(data.url)
                const blob = await response.blob()
                file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
            }

            const newPhoto = await createPhoto({
                title: data.title,
                description: data.description,
                folder: data.folder,
                file,
            })

            // Refresh folders list if a new folder was created
            if (data.folder && !folders.includes(data.folder)) {
                const updatedFolders = await getFolders()
                setFolders(updatedFolders)
            }

            setPhotos([newPhoto, ...photos])
            setIsAddDialogOpen(false)
        } catch (err) {
            console.error('Failed to add photo:', err)
            alert('写真の追加に失敗しました。後でもう一度お試しください。')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle folder selection
    const handleFolderSelect = (folder: string) => {
        setCurrentFolder(folder)
        setShowFolderMenu(false)
    }

    // Handle "All Photos" selection
    const handleAllPhotosSelect = () => {
        setCurrentFolder('')
        setShowFolderMenu(false)
    }

    return (
        <div className='min-h-screen relative'>
            <Header
                onAddPhotoClick={() => setIsAddDialogOpen(true)}
                onToggleFolderMenu={() => setShowFolderMenu(!showFolderMenu)}
                onAddFolderClick={() => setIsFolderUploadDialogOpen(true)}
            />

            {/* Folder slide menu */}
            <div
                ref={menuRef}
                className={`fixed right-0 top-[64px] h-[calc(100%-64px)] bg-white shadow-xl w-80 transform transition-transform duration-300 z-50 border-l border-gray-200 ${
                    showFolderMenu ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className='p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h3 className='text-xl font-bold text-gray-800'>
                            フォルダ一覧
                        </h3>
                        <button
                            onClick={() => setShowFolderMenu(false)}
                            className='text-gray-400 hover:text-gray-600 transition-colors'
                        >
                            ✕
                        </button>
                    </div>

                    <div className='space-y-2'>
                        <div
                            className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                                currentFolder === ''
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                            onClick={handleAllPhotosSelect}
                        >
                            <div className='flex items-center'>
                                <span className='text-lg mr-3'>📁</span>
                                <span className='font-medium'>
                                    すべての写真
                                </span>
                            </div>
                        </div>

                        {folders.length === 0 ? (
                            <div className='text-center py-8 text-gray-500'>
                                <div className='text-4xl mb-2'>📂</div>
                                <p>フォルダがありません</p>
                            </div>
                        ) : (
                            folders.map((folder) => (
                                <div
                                    key={folder}
                                    className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                                        currentFolder === folder
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                    }`}
                                    onClick={() => handleFolderSelect(folder)}
                                >
                                    <div className='flex items-center'>
                                        <span className='text-lg mr-3'>📁</span>
                                        <span className='font-medium truncate'>
                                            {folder}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <main className='container mx-auto px-4 py-8'>
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-12'>
                        <Loader2 className='w-12 h-12 animate-spin text-gray-400 mb-4' />
                        <p className='text-gray-500'>写真を読み込み中...</p>
                    </div>
                ) : error ? (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-6'>
                        <p>{error}</p>
                        <button
                            className='underline mt-2'
                            onClick={() => window.location.reload()}
                        >
                            再読み込み
                        </button>
                    </div>
                ) : photos.length === 0 ? (
                    <div className='text-center py-12'>
                        <p className='text-gray-500 mb-4'>写真がありません</p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            写真を追加する
                        </Button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {photos.map((photo) => (
                            <Card
                                key={photo.id}
                                className='rounded-xl shadow-md p-0 group relative overflow-hidden transition-transform duration-200 ease-out hover:scale-105 hover:shadow-lg h-80 flex flex-col'
                            >
                                <div className='relative flex-1'>
                                    <Image
                                        src={getPhotoUrl(
                                            photo.url,
                                            photo.folder
                                        )}
                                        alt={photo.title}
                                        width={400}
                                        height={300}
                                        className='w-full h-full object-cover rounded-t-xl'
                                    />
                                    <div className='absolute bottom-0 left-0 w-full px-4 pb-3 pt-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent'>
                                        <div className='font-bold text-lg text-white mb-1 truncate'>
                                            {photo.title}
                                        </div>
                                        <div className='text-white text-sm line-clamp-2 drop-shadow-sm'>
                                            {photo.description}
                                        </div>
                                    </div>
                                    <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10'>
                                        <Dialog
                                            open={
                                                isDialogOpen &&
                                                editPhoto?.id === photo.id
                                            }
                                            onOpenChange={(open) => {
                                                if (!isSubmitting)
                                                    setIsDialogOpen(open)
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    size='icon'
                                                    variant='secondary'
                                                    className='shadow bg-white/80 hover:bg-white'
                                                    onClick={() =>
                                                        handleEditClick(photo)
                                                    }
                                                    disabled={isSubmitting}
                                                >
                                                    <Pencil className='w-4 h-4 text-gray-700' />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        写真を編集
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <PhotoForm
                                                    initial={editData}
                                                    onSave={handleEditSave}
                                                    onCancel={() =>
                                                        setIsDialogOpen(false)
                                                    }
                                                    submitLabel={
                                                        isSubmitting
                                                            ? '保存中...'
                                                            : '保存'
                                                    }
                                                    photos={photos}
                                                    currentFolder={
                                                        editPhoto?.folder || ''
                                                    }
                                                    isEditMode={true}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            size='icon'
                                            variant='secondary'
                                            className='shadow bg-white/80 hover:bg-white'
                                            onClick={() =>
                                                handleDelete(photo.id)
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <Trash className='w-4 h-4 text-gray-700' />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={(open) => {
                        if (!isSubmitting) setIsAddDialogOpen(open)
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>写真を追加</DialogTitle>
                        </DialogHeader>
                        <PhotoForm
                            initial={{ title: '', description: '', url: '' }}
                            onSave={handleAddPhoto}
                            onCancel={() => setIsAddDialogOpen(false)}
                            submitLabel={isSubmitting ? '追加中...' : '追加'}
                            photos={photos}
                            currentFolder={currentFolder}
                            isEditMode={false}
                        />
                    </DialogContent>
                </Dialog>

                {/* Folder Upload Dialog */}
                <Dialog
                    open={isFolderUploadDialogOpen}
                    onOpenChange={(open) => {
                        if (!isSubmitting) setIsFolderUploadDialogOpen(open)
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                写真フォルダをアップロード
                            </DialogTitle>
                        </DialogHeader>
                        <PhotoForm
                            initial={{ title: '', description: '', url: '' }}
                            onSave={handleAddPhoto}
                            onCancel={() => setIsFolderUploadDialogOpen(false)}
                            submitLabel={
                                isSubmitting
                                    ? 'アップロード中...'
                                    : 'アップロード'
                            }
                            photos={[]} // Empty array to enable directory selection
                            currentFolder={currentFolder}
                            isEditMode={false}
                        />
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
