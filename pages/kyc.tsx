import { useEffect, useState } from 'react'
import RequireAuth from '../components/RequireAuth'
import { supabase } from '../lib/supabase'
import { User as UserIcon, IdCard, Camera, CheckCircle } from 'lucide-react'

type Profile = { user_id: string; email?: string; kyc_status?: 'pending'|'approved'|'rejected'|null; kyc_level?: number; kyc_submitted_at?: string|null }

export default function KycPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [level, setLevel] = useState<number>(1)
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [idType, setIdType] = useState('national_id')
  const [idNumber, setIdNumber] = useState('')
  const [country, setCountry] = useState('NG')
  const [idExpiry, setIdExpiry] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieNeutral, setSelfieNeutral] = useState<File | null>(null)
  const [selfieSmile, setSelfieSmile] = useState<File | null>(null)
  const [selfieLeft, setSelfieLeft] = useState<File | null>(null)
  const [selfieRight, setSelfieRight] = useState<File | null>(null)
  const [step, setStep] = useState<number>(1)
  const [cameraOn, setCameraOn] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const countrySchemas: Record<string, { name: string; idTypes: { value: string; label: string; pattern?: RegExp }[] }> = {
    NG: { name: 'Nigeria', idTypes: [
      { value: 'national_id', label: 'National ID (NIN)', pattern: /^[0-9]{11}$/ },
      { value: 'passport', label: 'Passport', pattern: /^[A-Z0-9]{8,9}$/ },
      { value: 'driver_license', label: 'Driver License', pattern: /^[A-Z0-9\-]{10,}$/ },
      { value: 'voter_card', label: 'Voter Card', pattern: /^[A-Z0-9]{10,}$/ },
    ]},
    US: { name: 'United States', idTypes: [
      { value: 'passport', label: 'Passport', pattern: /^[A-Z0-9]{9}$/ },
      { value: 'driver_license', label: 'Driver License', pattern: /^[A-Z0-9\-]{5,}$/ },
      { value: 'national_id', label: 'SSN (last 4)', pattern: /^[0-9]{4}$/ },
    ]},
    GB: { name: 'United Kingdom', idTypes: [
      { value: 'passport', label: 'Passport', pattern: /^[0-9]{9}$/ },
      { value: 'driver_license', label: 'Driver License', pattern: /^[A-Z0-9]{16}$/ },
    ]},
  }

  async function load() {
    try {
      const { data: user } = await supabase.auth.getUser()
      const uid = user.user?.id
      if (!uid) return
      const { data } = await supabase
        .from('profiles')
        .select('user_id,email,kyc_status,kyc_level,kyc_submitted_at')
        .eq('user_id', uid)
        .maybeSingle()
      setProfile((data as any) || null)
      if (typeof (data as any)?.kyc_level === 'number') setLevel(Number((data as any).kyc_level))
    } catch {}
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!cameraOn) return
    const v = document.querySelector('#kyc-selfie-video') as HTMLVideoElement | null
    setVideoEl(v)
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then((stream) => {
      setVideoStream(stream)
      if (v) { v.srcObject = stream; v.play() }
    }).catch(() => { setCameraOn(false) })
    return () => {
      try {
        videoStream?.getTracks()?.forEach((t) => t.stop())
      } catch {}
    }
  }, [cameraOn])

  function ext(f: File | null) { return f ? String(f.name.split('.').pop() || 'jpg').toLowerCase() : 'jpg' }
  function captureToFile(name: string) {
    if (!videoEl) return null
    const cvs = document.createElement('canvas')
    cvs.width = videoEl.videoWidth || 640
    cvs.height = videoEl.videoHeight || 480
    const ctx = cvs.getContext('2d')!
    ctx.drawImage(videoEl, 0, 0, cvs.width, cvs.height)
    return new Promise<File | null>((resolve) => {
      cvs.toBlob((b) => { resolve(b ? new File([b], name, { type: 'image/jpeg' }) : null) }, 'image/jpeg', 0.9)
    })
  }
  function getImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const cvs = document.createElement('canvas')
        cvs.width = img.naturalWidth
        cvs.height = img.naturalHeight
        const ctx = cvs.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        resolve(ctx.getImageData(0, 0, cvs.width, cvs.height))
      }
      img.onerror = (e) => reject(e)
      const url = URL.createObjectURL(file)
      img.src = url
    })
  }
  function diffPercent(a: ImageData, b: ImageData): number {
    const w = Math.min(a.width, b.width)
    const h = Math.min(a.height, b.height)
    let diff = 0
    let total = w * h
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const dr = Math.abs(a.data[i] - b.data[i])
        const dg = Math.abs(a.data[i+1] - b.data[i+1])
        const db = Math.abs(a.data[i+2] - b.data[i+2])
        const d = (dr + dg + db) / 3
        if (d > 25) diff++
      }
    }
    return Math.round((diff / total) * 1000) / 10
  }

  async function submit() {
    setLoading(true)
    setMsg('')
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error('Session expired')
      const { data: user } = await supabase.auth.getUser()
      const uid = user.user?.id
      if (!uid) throw new Error('Not authenticated')
      const idTypeDef = countrySchemas[country]?.idTypes.find((t) => t.value === idType)
      const idPattern = idTypeDef?.pattern
      if (!fullName || !dob || !address || !idType || !idNumber || !idFile) throw new Error('Fill all fields and attach files')
      if (idPattern && !idPattern.test(idNumber)) throw new Error('ID number format invalid for selected country/type')
      if (!selfieNeutral || !selfieSmile || !selfieLeft || !selfieRight) throw new Error('Capture all selfie steps (neutral, smile, left, right)')
      if (idFile.size > 6_000_000) throw new Error('ID file too large')
      const idOk = ['image/jpeg','image/png','application/pdf'].includes(idFile.type)
      if (!idOk) throw new Error('Invalid ID file type')
      const selfieFiles = [selfieNeutral, selfieSmile, selfieLeft, selfieRight]
      for (const s of selfieFiles) {
        if (s!.size > 6_000_000) throw new Error('Selfie too large')
        const ok = ['image/jpeg','image/png'].includes(s!.type)
        if (!ok) throw new Error('Invalid selfie file type')
      }

      const imgNeutral = await getImageData(selfieNeutral!)
      const imgSmile = await getImageData(selfieSmile!)
      const imgLeft = await getImageData(selfieLeft!)
      const imgRight = await getImageData(selfieRight!)
      const metrics = {
        diff_smile_vs_neutral: diffPercent(imgNeutral, imgSmile),
        diff_left_vs_neutral: diffPercent(imgNeutral, imgLeft),
        diff_right_vs_neutral: diffPercent(imgNeutral, imgRight),
      }
      const toDataUrl = (f: File) => new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result || '')); r.onerror = (e) => reject(e); r.readAsDataURL(f) })
      const body = {
        idFileDataUrl: await toDataUrl(idFile!),
        selfieNeutralDataUrl: await toDataUrl(selfieNeutral!),
        selfieSmileDataUrl: await toDataUrl(selfieSmile!),
        selfieLeftDataUrl: await toDataUrl(selfieLeft!),
        selfieRightDataUrl: await toDataUrl(selfieRight!),
        payload: { fullName, dob, address, country, idType, idNumber, idExpiry, level, livenessMetrics: metrics },
      }
      const upRes = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const upJson = await upRes.json()
      if (!upRes.ok) throw new Error(upJson.error || 'Upload failed')

      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ level }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submit failed')
      setMsg('KYC submitted for review')
      setFullName('')
      setDob('')
      setAddress('')
      setIdType('national_id')
      setIdNumber('')
      setIdFile(null)
      setSelfieNeutral(null)
      setSelfieSmile(null)
      setSelfieLeft(null)
      setSelfieRight(null)
      setStep(1)
      setCameraOn(false)
      load()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  const status = String(profile?.kyc_status || 'pending').toLowerCase()
  const submittedAt = profile?.kyc_submitted_at ? new Date(profile.kyc_submitted_at).toLocaleString() : null

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <IdCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">KYC Verification</h1>
              <p className="text-sm text-gray-600">Securely verify your identity to unlock withdrawals and advanced features.</p>
            </div>
          </div>
          {msg && <p className={`mb-3 text-sm ${status==='approved' ? 'text-green-700' : 'text-blue-700'}`}>{msg}</p>}
          <div className="rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4 bg-white text-gray-900">
            <p className="text-sm">Status: <span className={`px-2 py-1 rounded text-xs ${status==='approved'?'bg-green-100 text-green-800':status==='rejected'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800'}`}>{status}</span></p>
            {submittedAt && <p className="text-sm">Submitted: {submittedAt}</p>}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step>=1? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><UserIcon className="h-4 w-4" /></div>
              <div className={`h-1 w-10 rounded ${step>=2? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step>=2? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><IdCard className="h-4 w-4" /></div>
              <div className={`h-1 w-10 rounded ${step>=3? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step>=3? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><Camera className="h-4 w-4" /></div>
              <div className={`h-1 w-10 rounded ${step>=4? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step>=4? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><CheckCircle className="h-4 w-4" /></div>
            </div>
            <div className="text-xs text-gray-500">Step {step} of 4</div>
          </div>
          {step===1 && (
            <>
              <label className="block text-sm font-medium text-gray-900">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
              <label className="block text-sm font-medium text-gray-900">Date of Birth</label>
              <input value={dob} onChange={(e) => setDob(e.target.value)} className="border rounded px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" />
              <label className="block text-sm font-medium text-gray-900">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Street, City, Country" />
              <label className="block text-sm font-medium">KYC Level</label>
              <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="border rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[1,2,3].map(l => <option key={l} value={l}>Level {l}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg px-4 py-2">Next</button>
              </div>
            </>
          )}
          {step===2 && (
            <>
              <label className="block text-sm font-medium">Government ID Type</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-900">Country</label>
                  <select value={country} onChange={(e) => { setCountry(e.target.value); const first = countrySchemas[e.target.value]?.idTypes[0]?.value; if (first) setIdType(first) }} className="border rounded px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.keys(countrySchemas).map((c) => (<option key={c} value={c}>{countrySchemas[c].name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-900">ID Type</label>
                  <select value={idType} onChange={(e) => setIdType(e.target.value)} className="border rounded px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {(countrySchemas[country]?.idTypes || []).map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>
              </div>
              <label className="block text-sm font-medium text-gray-900">Government ID Number</label>
              <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ID Number" />
              <label className="block text-sm font-medium text-gray-900">ID Expiry Date</label>
              <input value={idExpiry} onChange={(e) => setIdExpiry(e.target.value)} className="border rounded px-3 py-2 w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" />
              <label className="block text-sm font-medium text-gray-900">Upload Government ID</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input onChange={(e) => setIdFile(e.target.files?.[0] || null)} className="w-full text-gray-900" type="file" accept="image/*,application/pdf" />
                <p className="text-xs text-gray-500 mt-1">Accepted: JPG, PNG, PDF up to 10MB</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="border text-blue-600 rounded-lg px-4 py-2">Back</button>
                <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg px-4 py-2">Next</button>
              </div>
            </>
          )}
          {step===3 && (
            <>
              <label className="block text-sm font-medium text-gray-900">Selfie Liveness</label>
              {!cameraOn && (
                <button onClick={() => setCameraOn(true)} className="bg-blue-600 text-white rounded px-4 py-2">Start Camera</button>
              )}
              <div className="space-y-2">
                <video id="kyc-selfie-video" className="w-full rounded-lg border border-gray-200 shadow-sm" />
                <div className="flex gap-2">
                  <button onClick={async () => { const f = await captureToFile('selfie_neutral.jpg'); if (f) setSelfieNeutral(f) }} className="border rounded-lg px-4 py-2">Capture Neutral</button>
                  <button onClick={async () => { const f = await captureToFile('selfie_smile.jpg'); if (f) setSelfieSmile(f) }} className="border rounded-lg px-4 py-2">Capture Smile</button>
                  <button onClick={async () => { const f = await captureToFile('selfie_left.jpg'); if (f) setSelfieLeft(f) }} className="border rounded-lg px-4 py-2">Capture Left</button>
                  <button onClick={async () => { const f = await captureToFile('selfie_right.jpg'); if (f) setSelfieRight(f) }} className="border rounded-lg px-4 py-2">Capture Right</button>
                  <input onChange={(e) => setSelfieNeutral(e.target.files?.[0] || null)} className="border rounded px-3 py-2 text-gray-900" type="file" accept="image/*" />
                  <input onChange={(e) => setSelfieSmile(e.target.files?.[0] || null)} className="border rounded px-3 py-2 text-gray-900" type="file" accept="image/*" />
                  <input onChange={(e) => setSelfieLeft(e.target.files?.[0] || null)} className="border rounded px-3 py-2 text-gray-900" type="file" accept="image/*" />
                  <input onChange={(e) => setSelfieRight(e.target.files?.[0] || null)} className="border rounded px-3 py-2 text-gray-900" type="file" accept="image/*" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="border text-blue-600 rounded-lg px-4 py-2">Back</button>
                <button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg px-4 py-2">Next</button>
              </div>
            </>
          )}
          {step===4 && (
            <>
              <div className="text-sm">Review and submit.</div>
              <button disabled={loading || status==='approved'} onClick={submit} className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg px-4 py-2 disabled:opacity-50">
                {loading ? 'Submitting…' : (status==='approved' ? 'Already Approved' : 'Submit KYC')}
              </button>
              <button onClick={() => setStep(3)} className="border text-blue-600 rounded-lg px-4 py-2 ml-2">Back</button>
            </>
          )}
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
