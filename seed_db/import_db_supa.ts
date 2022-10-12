import { get } from 'https'
import csvtojson from 'csvtojson'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://asavjwzyvjjyjdmsjlhv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjI4MTY3Njk3LCJleHAiOjE5NDM3NDM2OTd9.LQ5PTu_kQjjaVEQgMZxkMWklWbSCh_rYZiogtkJkRgU'

export const useSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// sql delete all guesses
// DELETE FROM guesses
const supabase = useSupabase()
const storageBucket = 'mimesis-public-images'

// const folders = ['art']
const folders = ['art', 'expression', 'improbable', 'rebus']
// const kinds = ['base']
const kinds = ['base', 'plus']

const modeId = {
  art: 1,
  art_plus: 2,
  expression: 3,
  expression_plus: 4,
  improbable: 5,
  improbable_plus: 5,
  rebus: 6,
  rebus_plus: 7,
}
const langId = 1

const urlToBuffer = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const data: Uint8Array[] = []
    get(url, (res) => {
      res
        .on('data', (chunk: Uint8Array) => {
          data.push(chunk)
        })
        .on('end', () => {
          resolve(Buffer.concat(data))
        })
        .on('error', (err) => {
          console.log('Error: ', url, err.message)
          reject(err)
        })
    })
  })
}

interface CsvImport {
  type: string
  title: string
  author: string
  cover: string
}
interface Guesses extends CsvImport {
  lang: number
  mode: number
}

const parseAndUpload = async (folder: string, kind: string) => {
  console.log('Load data csv', folder)
  const datas: Guesses[] = await csvtojson({ delimiter: ';' }).fromFile(
    `./seed_db/${folder}/${kind}.csv`,
  )
  console.log('Data csv loaded', folder)
  console.log('Prepare data', folder)
  // datas.length = 1

  const res = await Promise.all(datas.map(async (data) => {
    data.lang = langId
    const modeName = `${folder}${kind === 'plus' ? '_plus' : ''}`
    data.mode = modeId[modeName as keyof typeof modeId]
    // console.log('data', data);

    if (data.cover) {
      try {
        const body = await urlToBuffer(data.cover)
        const randomId = Math.random().toString(36).substring(2, 15)
        const destination = `${folder}/${randomId}`
        const res = await supabase
          .storage
          .from(storageBucket)
          .upload(destination, body)
        if (!res.error) {
          const res2 = await supabase
            .storage
            .from(storageBucket)
            .getPublicUrl(destination)
          if (!res2.error && res2.data)
            data.cover = res2.data.publicURL
        }
      }
      catch (err) {
        console.error(err, data.cover)
      }
    }
    return data
  }))
  console.log('Upload data', folder)
  await supabase
    .from ('guesses')
    .insert(res)
  console.log('Data csv uploaded', folder, kind)
}

const main = async () => {
  await Promise.all(folders.map(async (folder) => {
    if (kinds.includes('base')) {
      console.log('Upload base', folder)
      await parseAndUpload(folder, 'base')
    }
    if (kinds.includes('plus')) {
      console.log('Upload plus', folder)
      await parseAndUpload(folder, 'plus')
    }
  }))
}
main()
