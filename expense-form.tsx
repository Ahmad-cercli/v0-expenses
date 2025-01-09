'use client'

import { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const categories = ["Air Transportation", "Communications", "Meals", "Entertainment", "Equipment", "Ground Transportation", "Insurance", "Legal", "Other", "Travel"]
const currencies = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SPL", "SRD", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VEF", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWD"]

export default function ExpenseForm() {
  const [file, setFile] = useState<File | null>(null)
  const [merchant, setMerchant] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")
  const [amount, setAmount] = useState<string>("0.00")
  const [date, setDate] = useState<Date>()
  const [model, setModel] = useState<string>("cohere/command-r-08-2024")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ocrTime, setOcrTime] = useState<number | null>(null)
  const [llmTime, setLlmTime] = useState<number | null>(null)
  const [totalTime, setTotalTime] = useState<number | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Call the API with the uploaded file
      await processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model)
    // Add the file separately
    formData.append('file', file)
    
    // Add the info object as JSON
    const info = {
      model: model,
      provider: model === "mistralai/mixtral-8x7b-instruct" ? "Fireworks" : "Cohere"
    }
    formData.append('info', JSON.stringify(info))

    try {
      const response = await fetch('https://ff29-2001-8f8-1135-2f25-8d93-6e9b-e518-8e23.ngrok-free.app/process_file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('File processing failed')
      }

      const data = await response.json()
      console.log("data: ", data)
      
      // Update form fields based on the API response
      setMerchant(data.merchant || "")
      setCategory(data.category || "")
      setCurrency(data.currency || "USD")
      setAmount(data.amount?.toString() || "0.00")
      setDate(data.date ? parse(data.date, 'dd/MM/yyyy', new Date()) : undefined)
      setOcrTime(data.ocr_time || null)
      setLlmTime(data.llm_time || null)
      setTotalTime(data.total_time || null)
    } catch (error) {
      console.error('Error processing file:', error)
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFile(null)
    setMerchant("")
    setCategory("")
    setCurrency("USD")
    setAmount("0.00")
    setDate(undefined)
    setModel("cohere/command-r-08-2024")
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
    <Card className="w-full max-w-2xl m-4">
      <CardHeader>
        <CardTitle>Expense Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="model">Choose model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cohere/command-r-08-2024">cohere/command-r-08-2024</SelectItem>
              <SelectItem value="mistralai/mixtral-8x7b-instruct">
                mistralai/mixtral-8x7b-instruct
                <span className="ml-2 text-sm text-muted-foreground">(faster but less accurate)</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="file">Upload File or drop it here (png, jpg, jpeg, pdf only)</Label>
          <div className="relative">
            <Input
              id="file"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              className="bg-[#f4fbff]"
              disabled={isLoading}
              ref={fileInputRef}
              multiple={false}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <Loader2 className="h-6 w-6 text-gray-500" style={{ animation: 'spin 0.5s linear infinite' }} />
              </div>
            )}
          </div>
        </div>
        <hr className="my-6 border-t border-gray-200" />
        <div>
          <Label htmlFor="merchant">Merchant</Label>
          <Input
            id="merchant"
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className=""
            disabled={isLoading}
            placeholder='Enter merchant name'
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expense">Expense Amount</Label>
            <div className="flex">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="expense"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 ml-2"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="date">Expense Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          {(ocrTime || llmTime || totalTime) && (
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {ocrTime !== null && (
                <p>Time taken to do OCR: {ocrTime.toFixed(2)}s</p>
              )}
              {llmTime !== null && (
                <p>Time taken for LLM inference: {llmTime.toFixed(2)}s</p>
              )}
              {totalTime !== null && (
                <div>
                  <p>Total time: {totalTime.toFixed(2)}s</p>
                  <p>Because the backend is currently running on my machine it takes time to receive the API request, but the total time above is the time taken from "request received" to "response sent"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleReset} variant="outline" className="bg-[#d2d7dc]">
          Reset
        </Button>
      </CardFooter>
    </Card>
    </div>
  )
}

