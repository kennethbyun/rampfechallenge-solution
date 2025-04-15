import { useContext, useEffect, useState } from "react"
import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"
import { AppContext } from "src/utils/context"

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const [approved, setApproved] = useState(transaction.approved)
  const { cache } = useContext(AppContext)

  // parent needs to fetch new updated transaction data
  useEffect(() => {
    setApproved(transaction.approved)
  }, [transaction.approved])

  const handleCheckboxChange = async (newValue: boolean) => {
    try {
      await consumerSetTransactionApproval({
        transactionId: transaction.id,
        newValue,
      })
      setApproved(newValue)

      // invalidate the cache for both all employees as well as individuals.
      if (cache?.current) {
        cache.current.forEach((value, key) => {
          if (key.startsWith("transactionsByEmployee") || key.startsWith("paginatedTransactions")) {
            cache.current.delete(key)
          }
        })
      }
    } catch (error) {
      console.error("Error updating transaction approval:", error)
    }
  }

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={handleCheckboxChange}
      />
    </div>
  )
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
