import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/Auth'
import ErrorModal from '@/components/ErrorModal'
import Loading from '@/components/Loading'

function LedgerReports({navigate}) {
  const { axiosAPI } = useAuth()
  const [customers, setCustomers] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [customer, setCustomer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null)
  const [ledgerData, setLedgerData] = useState([])
  const [showReport, setShowReport] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')

  const closeModal = () => setIsModalOpen(false)

  // Fetch customers on component mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)
        const currentDivisionId = localStorage.getItem('currentDivisionId')
        let endpoint = "/customers"
        if (currentDivisionId && currentDivisionId !== '1') {
          endpoint += `?divisionId=${currentDivisionId}`
        } else if (currentDivisionId === '1') {
          endpoint += `?showAllDivisions=true`
        }
        const res = await axiosAPI.get(endpoint)
        const customersList = res.data.customers || []

        const dummyCustomer = {
          id: 'dummy-001',
          name: 'DIGAMBAR SHANKAR SAWANT',
          address: 'SNO 27 1/2, CHANRABHAGA NIVAS, GHATE COLONY, WAI SATARA MH',
          aadhar: '924823386904',
          location: '28.704100, 77.102500',
          contact: '+91-8888000743',
          email: '',
          isDummy: true
        }
        setCustomers([dummyCustomer, ...customersList])
      } catch (err) {
        setError("Failed to fetch customers")
        setIsModalOpen(true)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const handleSubmit = () => {
    if (!customer) {
      setError("Please select a customer")
      setIsModalOpen(true)
      return
    }

    const selectedCustomer = customers.find(c => String(c.id) === String(customer))
    if (selectedCustomer) {
      setSelectedCustomerDetails(selectedCustomer)
      setShowReport(true)
      setInfoMessage('')

      // Only dummy customer has sample data
      if (selectedCustomer.id !== 'dummy-001') {
        setLedgerData([])
        setInfoMessage('No ledger data found for this customer')
        return
      }

      // Load dummy ledger data (in batches)
      setLedgerData([
        { date: '01 Apr 25', particulars: 'Opening Balance', vchType: '', vchNo: '', debit: '0.00', credit: '', balance: '0.00' },
        { date: '18 Jun 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00012', debit: '', credit: '29,150.00', balance: '29,150.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '36', debit: '29,150.00', credit: '', balance: '' },
        { date: '26 Jun 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '51', debit: '3,590.00', credit: '', balance: '3,590.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00024', debit: '', credit: '3,590.00', balance: '' },
        { date: '29 Jun 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '55', debit: '50,250.00', credit: '', balance: '50,250.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '56', debit: '11,740.00', credit: '', balance: '61,990.00 Cr' },
        { date: '30 Jun 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00027', debit: '', credit: '50,250.00', balance: '11,740.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00028', debit: '', credit: '11,740.00', balance: '' },
      ])

      setLedgerData(prev => ([
        ...prev,
        { date: '08 Jul 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '68', debit: '33,490.00', credit: '', balance: '33,490.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00039', debit: '', credit: '33,490.00', balance: '' },
        { date: '12 Jul 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '81', debit: '42,080.00', credit: '', balance: '42,080.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00052', debit: '', credit: '42,080.00', balance: '' },
        { date: '16 Jul 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '95', debit: '57,100.00', credit: '', balance: '57,100.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00064', debit: '', credit: '57,100.00', balance: '' },
        { date: '23 Jul 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '113', debit: '30,250.00', credit: '', balance: '30,250.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00079', debit: '', credit: '31,250.00', balance: '1,000.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '12', debit: '1,000.00', credit: '', balance: '' },
        { date: '26 Jul 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00090', debit: '', credit: '42,820.00', balance: '42,820.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '131', debit: '41,270.00', credit: '', balance: '1,550.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '16', debit: '1,550.00', credit: '', balance: '' },
        { date: '30 Jul 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '142', debit: '27,400.00', credit: '', balance: '27,400.00 Cr' },
        { date: '', particulars: 'Carried Over', vchType: '', vchNo: '', debit: '3,01,470.00', credit: '3,28,870.00', balance: '' },
      ]))

      setLedgerData(prev => ([
        ...prev,
        { date: '', particulars: 'Brought Forward', vchType: '', vchNo: '', debit: '3,01,470.00', credit: '3,28,870.00', balance: '' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00101', debit: '', credit: '28,400.00', balance: '1,000.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '20', debit: '1,000.00', credit: '', balance: '' },
        { date: '31 Jul 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00105', debit: '', credit: '25,560.00', balance: '25,560.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '146', debit: '24,660.00', credit: '', balance: '900.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '23', debit: '900.00', credit: '', balance: '' },
        { date: '01 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '152', debit: '22,350.00', credit: '', balance: '22,350.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00110', debit: '', credit: '22,350.00', balance: '' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '26', debit: '750.00', credit: '', balance: '750.00 Cr' },
        { date: '03 Aug 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00114', debit: '', credit: '75,800.00', balance: '75,050.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '156', debit: '72,550.00', credit: '', balance: '2,500.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '28', debit: '2,500.00', credit: '', balance: '' },
        { date: '06 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '166', debit: '31,770.00', credit: '', balance: '31,770.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00122', debit: '', credit: '31,770.00', balance: '' },
        { date: '09 Aug 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00128', debit: '', credit: '29,150.00', balance: '29,150.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '171', debit: '29,150.00', credit: '', balance: '' },
      ]))

      setLedgerData(prev => ([
        ...prev,
        { date: '11 Aug 25', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00131', debit: '', credit: '52,400.00', balance: '52,400.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '173', debit: '48,600.00', credit: '', balance: '3,800.00 Dr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '174', debit: '42,940.00', credit: '', balance: '39,140.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00133', debit: '', credit: '44,540.00', balance: '5,400.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '35', debit: '1,750.00', credit: '', balance: '3,650.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '37', debit: '1,600.00', credit: '', balance: '2,050.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '38', debit: '1,050.00', credit: '', balance: '1,000.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '39', debit: '1,000.00', credit: '', balance: '' },
        { date: '14 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '184', debit: '27,650.00', credit: '', balance: '27,650.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00144', debit: '', credit: '27,650.00', balance: '' },
        { date: '16 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '194', debit: '43,350.00', credit: '', balance: '43,350.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00149', debit: '', credit: '43,350.00', balance: '' },
        { date: '19 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '201', debit: '40,550.00', credit: '', balance: '40,550.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00155', debit: '', credit: '44,550.00', balance: '4,000.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '46', debit: '1,500.00', credit: '', balance: '2,500.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '47', debit: '1,500.00', credit: '', balance: '1,000.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '48', debit: '1,000.00', credit: '', balance: '' },
        { date: '24 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '233', debit: '73,250.00', credit: '', balance: '73,250.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '234', debit: '14,840.00', credit: '', balance: '88,090.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00171', debit: '', credit: '73,250.00', balance: '14,840.00 Cr' },
        { date: '', particulars: 'Carried Over', vchType: '', vchNo: '', debit: '8,00,240.00', credit: '8,15,080.00', balance: '' },
      ]))

      setLedgerData(prev => ([
        ...prev,
        { date: '', particulars: 'Brought Forward', vchType: '', vchNo: '', debit: '8,00,240.00', credit: '8,15,080.00', balance: '' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '59', debit: '2,500.00', credit: '', balance: '17,340.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00172', debit: '', credit: '17,940.00', balance: '600.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '60', debit: '600.00', credit: '', balance: '' },
        { date: '25 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '236', debit: '34,750.00', credit: '', balance: '34,750.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00175', debit: '', credit: '34,750.00', balance: '' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '65', debit: '1,250.00', credit: '', balance: '1,250.00 Cr' },
        { date: '26 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '244', debit: '47,300.00', credit: '', balance: '48,550.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00180', debit: '', credit: '50,300.00', balance: '1,750.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '69', debit: '1,750.00', credit: '', balance: '' },
        { date: '27 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '252', debit: '36,940.00', credit: '', balance: '36,940.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '251', debit: '37,300.00', credit: '', balance: '74,240.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00188', debit: '', credit: '39,540.00', balance: '34,700.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00189', debit: '', credit: '37,300.00', balance: '2,600.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '75', debit: '1,250.00', credit: '', balance: '1,350.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '76', debit: '1,350.00', credit: '', balance: '' },
        { date: '31 Aug 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '271', debit: '16,700.00', credit: '', balance: '16,700.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00207', debit: '', credit: '17,200.00', balance: '500.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '95', debit: '500.00', credit: '', balance: '' },
        { date: '04 Sep 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '286', debit: '72,850.00', credit: '', balance: '72,850.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00212', debit: '', credit: '75,350.00', balance: '2,500.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '104', debit: '2,500.00', credit: '', balance: '' },
        { date: '07 Sep 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '291', debit: '14,200.00', credit: '', balance: '14,200.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '292', debit: '34,650.00', credit: '', balance: '48,850.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00216', debit: '', credit: '14,200.00', balance: '34,650.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00217', debit: '', credit: '36,400.00', balance: '1,750.00 Dr' },
      ]))

      setLedgerData(prev => ([
        ...prev,
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '107', debit: '500.00', credit: '', balance: '1,250.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '108', debit: '1,250.00', credit: '', balance: '' },
        { date: '13 Sep 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '332', debit: '23,550.00', credit: '', balance: '23,550.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '334', debit: '6,840.00', credit: '', balance: '30,390.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '333', debit: '97,240.00', credit: '', balance: '1,27,630.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00238', debit: '', credit: '23,550.00', balance: '1,04,080.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00239', debit: '', credit: '1,08,530.00', balance: '4,450.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '124', debit: '750.00', credit: '', balance: '3,700.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '125', debit: '3,700.00', credit: '', balance: '' },
        { date: '15 Sep 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '345', debit: '43,440.00', credit: '', balance: '43,440.00 Cr' },
        { date: '', particulars: 'Carried Over', vchType: '', vchNo: '', debit: '12,55,300.00', credit: '12,98,740.00', balance: '' },
        { date: '', particulars: 'Brought Forward', vchType: '', vchNo: '', debit: '12,55,300.00', credit: '12,98,740.00', balance: '' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00247', debit: '', credit: '44,790.00', balance: '1,350.00 Dr' },
        { date: '16 Sep 25', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '134', debit: '1,350.00', credit: '', balance: '' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '353', debit: '43,840.00', credit: '', balance: '43,840.00 Cr' },
        { date: '', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '357', debit: '24,400.00', credit: '', balance: '68,240.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00250', debit: '', credit: '45,440.00', balance: '22,800.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00252', debit: '', credit: '25,400.00', balance: '2,600.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '137', debit: '1,600.00', credit: '', balance: '1,000.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '138', debit: '1,000.00', credit: '', balance: '' },
        { date: '19 Sep 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '368', debit: '44,850.00', credit: '', balance: '44,850.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00254', debit: '', credit: '46,350.00', balance: '1,500.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '142', debit: '1,500.00', credit: '', balance: '' },
        { date: '20 Sep 25', particulars: 'YES BANK LIMITED', vchType: 'Receipt', vchNo: '374', debit: '50,780.00', credit: '', balance: '50,780.00 Cr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Sales', vchNo: 'INV-2025-26-00258', debit: '', credit: '52,480.00', balance: '1,700.00 Dr' },
        { date: '', particulars: 'Sales Of Cattle Feed', vchType: 'Credit Note', vchNo: '145', debit: '1,700.00', credit: '', balance: '' },
        { date: '', particulars: '', vchType: '', vchNo: '', debit: '14,69,760.00', credit: '14,69,760.00', balance: '' },
        { date: '', particulars: 'Closing Balance', vchType: '', vchNo: '', debit: '0.00', credit: '', balance: '' },
        { date: '', particulars: '', vchType: '', vchNo: '', debit: '14,69,760.00', credit: '14,69,760.00', balance: '' },
      ]))
    }
  }

  const handleCancel = () => {
    setFromDate('')
    setToDate('')
    setCustomer('')
    setSelectedCustomerDetails(null)
    setLedgerData([])
    setShowReport(false)
    setInfoMessage('')
  }

  // Forward-fill empty dates with previous non-empty date for display
  const filledLedgerData = useMemo(() => {
    let lastDate = ''
    return ledgerData.map((row) => {
      const displayDate = row.date && row.date.trim() !== '' ? row.date : lastDate
      if (row.date && row.date.trim() !== '') lastDate = row.date
      return { ...row, displayDate }
    })
  }, [ledgerData])

  function parseLedgerDate(d) {
    if (!d) return null
    const parts = d.split(' ').filter(Boolean)
    if (parts.length !== 3) return null
    const [dd, mon, yy] = parts
    const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }
    const m = monthMap[mon]
    const day = parseInt(dd, 10)
    const year = 2000 + parseInt(yy, 10)
    if (Number.isNaN(day) || m == null || Number.isNaN(year)) return null
    return new Date(year, m, day)
  }

  const rangedLedgerData = useMemo(() => {
    if (!fromDate && !toDate) return filledLedgerData
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null
    return filledLedgerData.filter((row) => {
      const d = parseLedgerDate(row.displayDate)
      if (!d) return true
      if (from && d < from) return false
      if (to) {
        const toEnd = new Date(to)
        toEnd.setHours(23,59,59,999)
        if (d > toEnd) return false
      }
      return true
    })
  }, [filledLedgerData, fromDate, toDate])

  return (
     <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i className="bi bi-chevron-right"></i> Ledger-Reports
      </p>

      {/* Filters */}
      <div className="row m-0 p-3">
        <div className="col-3 formcontent">
          <label>From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="col-3 formcontent">
          <label>To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="col-3 formcontent">
          <label>Customer:</label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          >
            <option value="">--select--</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-3 formcontent">
          <button className="submitbtn" onClick={handleSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      {/* Loading and Error Modals */}
      {loading && <Loading />}
      {error && (
        <ErrorModal
          show={isModalOpen}
          onHide={closeModal}
          message={error}
        />
      )}

      {/* Centered Header Details */}
      {showReport && selectedCustomerDetails && (
        <div className="row m-0 p-3">
          <div className="col-12 text-center">
            <h3 className="fw-bold mb-2">FB AGRI VET PRIVATE LIMITED</h3>
            <div className="mb-2">CS NO 3651,</div>
            <div className="mb-2">Kachare Housing Society,</div>
            <div className="mb-2">JAYSINGPUR KOLHAPUR ROAD</div>
            <div className="mb-2">SAMBHJIPUR, Jaysingpur, Kolhapur,, Maharashtra - 416101</div>
            <div className="mb-3">E-Mail :finance@feedbazaar.in</div>

            <h5 className="fw-bold mb-1">{selectedCustomerDetails.name}</h5>
            <div className="mb-1">Ledger Account</div>
            <div className="mb-1">{selectedCustomerDetails.address}</div>
            <div className="mb-1">Aadhar no : {selectedCustomerDetails.aadhar}</div>
            <div className="mb-1">Location : {selectedCustomerDetails.location}</div>
            <div className="mb-3">Contact : {selectedCustomerDetails.contact}</div>

            {rangedLedgerData.length > 0 && (
              <div className="mt-2">
                {rangedLedgerData[0].displayDate} To {rangedLedgerData[rangedLedgerData.length - 1].displayDate}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ledger Table */}
      {showReport && (
        <div className="row m-0 p-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Ledger Account</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered borderedtable">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Particulars</th>
                        <th>Vch Type</th>
                        <th>Vch No.</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rangedLedgerData.length > 0 ? (
                        rangedLedgerData.map((row, index) => (
                          <tr key={index} className={row.date === '' ? 'table-light' : ''}>
                            <td>{row.displayDate}</td>
                            <td>{row.particulars}</td>
                            <td>{row.vchType}</td>
                            <td>{row.vchNo}</td>
                            <td className="text-end">{row.debit}</td>
                            <td className="text-end">{row.credit}</td>
                            <td className="text-end">{row.balance}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">
                            {infoMessage || (fromDate || toDate ? 'No data for selected date range' : 'No ledger data available.')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LedgerReports