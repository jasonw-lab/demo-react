'use client'
import React, { useState } from 'react'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'

type Photo = {
    id: number
    title: string
    description: string
    date: string
    url: string
}

// 仮の写真データ
const initialPhotos: Photo[] = [
    {
        id: 1,
        title: '桜の風景',
        description: '春の桜が咲き誇る美しい風景',
        date: '2024/3/15 9:00:00',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 2,
        title: '美しい夕日',
        description: '海辺に沈む夕日が幻想的',
        date: '2024/4/1 18:30:00',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 3,
        title: '山の景色',
        description: '澄んだ空気と壮大な山々',
        date: '2024/5/10 7:45:00',
        url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 4,
        title: '竹林の小径',
        description: '京都の美しい竹林の散策路',
        date: '2024/3/25 9:00:00',
        url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 5,
        title: '紅葉の庭園',
        description: '秋の紅葉に彩られた日本庭園',
        date: '2024/4/30 9:00:00',
        url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 6,
        title: '山間の温泉',
        description: '山々に囲まれた静かな温泉地',
        date: '2024/5/4 9:00:00',
        url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 7,
        title: '田園風景',
        description: '日本の美しい田園風景',
        date: '2024/4/10 9:00:00',
        url: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 8,
        title: '夜桜',
        description: '夜にライトアップされた桜並木',
        date: '2024/4/5 19:00:00',
        url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 9,
        title: '海辺の思い出',
        description: '家族で訪れた夏の海辺',
        date: '2024/8/1 10:00:00',
        url: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 10,
        title: '冬の雪景色',
        description: '真っ白な雪に包まれた静かな朝',
        date: '2024/12/20 7:00:00',
        url: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=800&q=80',
    },
]

function PhotoForm({
    initial,
    onSave,
    onCancel,
    submitLabel = '保存',
}: {
    initial: { title: string; description: string; url: string }
    onSave: (data: { title: string; description: string; url: string }) => void
    onCancel: () => void
    submitLabel?: string
}) {
    const [form, setForm] = useState(initial)
    const [fileName, setFileName] = useState('選択されていません')
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setForm((prev) => ({ ...prev, url }))
            setFileName(file.name)
        } else {
            setFileName('選択されていません')
        }
    }
    return (
        <form
            className='flex flex-col gap-4'
            onSubmit={(e) => {
                e.preventDefault()
                onSave(form)
            }}
        >
            {form.url && (
                <img
                    src={form.url}
                    alt='preview'
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
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
    const [editPhoto, setEditPhoto] = useState<Photo | null>(null)
    const [editData, setEditData] = useState<{
        title: string
        description: string
        url: string
    }>({ title: '', description: '', url: '' })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const handleEditClick = (photo: Photo) => {
        setEditPhoto(photo)
        setEditData({
            title: photo.title,
            description: photo.description,
            url: photo.url,
        })
        setIsDialogOpen(true)
    }

    const handleEditSave = () => {
        if (!editPhoto) return
        setPhotos(
            photos.map((p) =>
                p.id === editPhoto.id ? { ...p, ...editData } : p
            )
        )
        setIsDialogOpen(false)
    }

    const handleDelete = (id: number) => {
        setPhotos(photos.filter((p) => p.id !== id))
    }

    const handleAddPhoto = (data: {
        title: string
        description: string
        url: string
    }) => {
        setPhotos([
            {
                id: Math.max(0, ...photos.map((p) => p.id)) + 1,
                title: data.title,
                description: data.description,
                url: data.url,
                date: new Date().toLocaleString(),
            },
            ...photos,
        ])
        setIsAddDialogOpen(false)
    }

    return (
        <div className='min-h-screen'>
            <Header onAddPhotoClick={() => setIsAddDialogOpen(true)} />
            <main className='container mx-auto px-4 py-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {photos.map((photo) => (
                        <Card
                            key={photo.id}
                            className='rounded-xl shadow-md p-0 group relative overflow-hidden transition-transform duration-200 ease-out hover:scale-105 hover:shadow-lg h-80 flex flex-col'
                        >
                            <div className='relative flex-1'>
                                <img
                                    src={photo.url}
                                    alt={photo.title}
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
                                        onOpenChange={setIsDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                size='icon'
                                                variant='secondary'
                                                className='shadow bg-white/80 hover:bg-white'
                                                onClick={() =>
                                                    handleEditClick(photo)
                                                }
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
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        size='icon'
                                        variant='secondary'
                                        className='shadow bg-white/80 hover:bg-white'
                                        onClick={() => handleDelete(photo.id)}
                                    >
                                        <Trash className='w-4 h-4 text-gray-700' />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>写真を追加</DialogTitle>
                        </DialogHeader>
                        <PhotoForm
                            initial={{ title: '', description: '', url: '' }}
                            onSave={handleAddPhoto}
                            onCancel={() => setIsAddDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
