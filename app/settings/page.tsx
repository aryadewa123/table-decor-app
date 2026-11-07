'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import TopHeader from '@/components/TopHeader'
import { useAuth } from '@/lib/auth-context'
import { translate, type AppLanguage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const MAX_AVATAR_SIZE = 3 * 1024 * 1024
const AVATAR_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

const subscribeToDisplayMode = (callback: () => void) => {
  const query = window.matchMedia('(display-mode: standalone)')
  query.addEventListener('change', callback)
  window.addEventListener('appinstalled', callback)
  return () => {
    query.removeEventListener('change', callback)
    window.removeEventListener('appinstalled', callback)
  }
}

const getDisplayMode = () => {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
}

const getServerDisplayMode = () => false

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, logout, updateProfile } = useAuth()
  const [draft, setDraft] = useState<{
    userId: string
    name: string
    language: AppLanguage
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInstalled = useSyncExternalStore(
    subscribeToDisplayMode,
    getDisplayMode,
    getServerDisplayMode
  )

  const profile = user
    ? draft?.userId === user.id
      ? draft
      : { userId: user.id, name: user.name, language: user.language }
    : null
  const language = profile?.language ?? 'id'
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, router, user])

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setInstallPrompt(null)
      setMessage(translate(language, 'settings.installSuccess'))
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [language])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!profile?.name.trim()) {
      setError(t('settings.error'))
      return
    }

    setIsSaving(true)
    const result = await updateProfile({
      name: profile.name,
      language: profile.language,
    })
    setIsSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setMessage(t('settings.saved'))
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !user) return

    setMessage('')
    setError('')
    const extension = AVATAR_TYPES.get(file.type)
    if (!extension) {
      setError(t('settings.photoType'))
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError(t('settings.photoTooLarge'))
      return
    }

    setIsUploading(true)
    const path = `${user.id}/avatar.${extension}`
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      setError(uploadError.message)
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path)
    const result = await updateProfile({
      avatarUrl: `${publicUrl}?v=${Date.now()}`,
    })

    setIsUploading(false)
    if (result.error) {
      setError(result.error)
      return
    }

    setMessage(t('settings.saved'))
  }

  const handleInstall = async () => {
    if (!installPrompt) {
      setMessage(t('settings.installUnavailable'))
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setMessage(t('settings.installSuccess'))
    }
    setInstallPrompt(null)
  }

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-sm text-[#7B739B]">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-transparent">
      <TopHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 space-y-6">
        <header className="border-b border-[#DED9F4]/70 pb-4">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#322A5E]">
            {t('settings.title')}
          </h1>
          <p className="text-sm text-[#7B739B] mt-1">{t('settings.subtitle')}</p>
        </header>

        {(message || error) && (
          <div
            role={error ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {error || message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-2xl border border-[#E7E3F3] bg-white/95 p-4 sm:p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-serif text-xl font-bold text-[#322A5E]">
                {t('settings.profile')}
              </h2>
              <p className="text-sm text-[#7B739B] mt-1">
                {t('settings.profileDescription')}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#EAE5F8] border border-[#DED9F4] flex items-center justify-center text-xl font-bold text-[#4A3E85] shrink-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#322A5E]">{t('settings.photo')}</p>
                <p className="text-xs text-[#7B739B] mt-1">{t('settings.photoHint')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
                <button
                  type="button"
                  disabled={isUploading || isSaving}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 rounded-lg border border-[#DED9F4] px-3 py-1.5 text-xs font-semibold text-[#4A3E85] hover:bg-[#F6F4FC] disabled:opacity-60"
                >
                  {isUploading ? t('settings.uploading') : t('settings.changePhoto')}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#4A3E85]">
                {t('settings.name')}
                <input
                  value={profile?.name ?? ''}
                  onChange={(event) => {
                    if (profile) {
                      setDraft({ ...profile, name: event.target.value })
                    }
                  }}
                  maxLength={80}
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-xl border border-[#DED9F4] bg-white px-3.5 py-2.5 text-sm text-[#2D2A3E] outline-none focus:ring-2 focus:ring-[#B1A9DA]/50"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-[#4A3E85]">
                {t('settings.email')}
                <input
                  value={user.email}
                  readOnly
                  className="mt-1.5 w-full rounded-xl border border-[#DED9F4] bg-[#F6F4FC] px-3.5 py-2.5 text-sm text-[#7B739B]"
                />
              </label>
              <label className="block text-sm font-medium text-[#4A3E85] sm:col-span-2">
                {t('settings.role')}
                <input
                  value={user.role}
                  readOnly
                  className="mt-1.5 w-full rounded-xl border border-[#DED9F4] bg-[#F6F4FC] px-3.5 py-2.5 text-sm text-[#7B739B]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E7E3F3] bg-white/95 p-4 sm:p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#322A5E]">
              {t('settings.language')}
            </h2>
            <p className="text-sm text-[#7B739B] mt-1 mb-4">
              {t('settings.languageDescription')}
            </p>
            <select
              value={language}
              onChange={(event) => {
                if (profile) {
                  setDraft({
                    ...profile,
                    language: event.target.value as AppLanguage,
                  })
                }
              }}
              className="w-full sm:max-w-sm rounded-xl border border-[#DED9F4] bg-white px-3.5 py-2.5 text-sm text-[#2D2A3E] outline-none focus:ring-2 focus:ring-[#B1A9DA]/50"
            >
              <option value="id">{t('settings.indonesian')}</option>
              <option value="en">{t('settings.english')}</option>
            </select>
          </section>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full sm:w-auto rounded-xl bg-[#4A3E85] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#322A5E] disabled:opacity-60"
          >
            {isSaving ? t('settings.saving') : t('settings.save')}
          </button>
        </form>

        <section className="rounded-2xl border border-[#E7E3F3] bg-white/95 p-4 sm:p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-[#322A5E]">
            {t('settings.install')}
          </h2>
          <p className="text-sm text-[#7B739B] mt-1 mb-4">
            {t('settings.installDescription')}
          </p>
          <button
            type="button"
            onClick={handleInstall}
            disabled={isInstalled}
            className="rounded-xl border border-[#DED9F4] px-4 py-2.5 text-sm font-semibold text-[#4A3E85] hover:bg-[#F6F4FC]"
          >
            {isInstalled ? t('settings.installed') : t('settings.install')}
          </button>
        </section>

        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
        >
          {t('settings.logout')}
        </button>
      </main>
      <BottomNav />
    </div>
  )
}
