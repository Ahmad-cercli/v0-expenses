'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const categories = ["Food", "Transport", "Entertainment", "Utilities", "Other"]
const currencies = ["USD", "AED", "EUR", "GBP", "JPY"]

export default function ExpenseForm() {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")
  const [amount, setAmount] = useState<string>("0.00")
  const [date, setDate] = useState<Date>()
  const [model, setModel] = useState<string>("cohere/command-r-08-2024")
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

    try {
      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('File processing failed')
      }

      const data = await response.json()
      
      // Update form fields based on the API response
      setCategory(data.category || "")
      setCurrency(data.currency || "USD")
      setAmount(data.amount?.toString() || "0.00")
      setDate(data.date ? new Date(data.date) : undefined)
    } catch (error) {
      console.error('Error processing file:', error)
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
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
          <Label htmlFor="file">Upload File (PNG, JPEG, JPG)</Label>
          <Input
            id="file"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="bg-[#f4fbff]"
            disabled={isLoading}
          />
        </div>
        <hr className="my-6 border-t border-gray-200" />
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

