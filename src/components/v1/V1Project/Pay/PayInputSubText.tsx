import { BigNumber } from '@ethersproject/bignumber'
import { formatWad } from 'utils/formatNumber'
import { parseEther } from 'ethers/lib/utils'
import { useCurrencyConverter } from 'hooks/v1/CurrencyConverter'
import { currencyName } from 'utils/currency'
import { weightedRate } from 'utils/math'
import { tokenSymbolText } from 'utils/tokenSymbolText'
import { Trans } from '@lingui/macro'
import { CurrencyOption } from 'models/currency-option'
import { useContext, useMemo } from 'react'

import { V1ProjectContext } from 'contexts/v1/projectContext'
import { Tooltip } from 'antd'
import { ThemeContext } from 'contexts/themeContext'
import AMMPrices from 'components/shared/AMMPrices'

import TooltipIcon from 'components/shared/TooltipIcon'

import { CURRENCY_ETH } from 'constants/currency'

/**
 * Help text shown below the Pay input field.
 *
 * If the user has entered an amount, display
 * the amount of project tokens they will recieve.
 *
 * Else, display the exchange rate of the user selected currency to project token.
 */
export default function PayInputSubText({
  payInCurrrency,
  weiPayAmt,
}: {
  payInCurrrency: CurrencyOption
  weiPayAmt: BigNumber | undefined
}) {
  const { currentFC, tokenSymbol, tokenAddress } = useContext(V1ProjectContext)
  const converter = useCurrencyConverter()
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const tokenText = tokenSymbolText({
    tokenSymbol: tokenSymbol,
    capitalize: false,
    plural: true,
  })

  const receiveText = useMemo(() => {
    const formatReceivedTickets = (wei: BigNumber) => {
      const exchangeRate = weightedRate(currentFC, wei, 'payer')
      return formatWad(exchangeRate, { precision: 0 })
    }

    if (weiPayAmt?.gt(0)) {
      return `${formatReceivedTickets(weiPayAmt)} ${tokenText}`
    }

    const receivedTickets = formatReceivedTickets(
      (payInCurrrency === CURRENCY_ETH
        ? parseEther('1')
        : converter.usdToWei('1')) ?? BigNumber.from(0),
    )
    return `${receivedTickets} ${tokenText}/${currencyName(payInCurrrency)}`
  }, [converter, payInCurrrency, tokenText, weiPayAmt, currentFC])

  return (
    <div style={{ fontSize: '.7rem' }}>
      <Trans>Receive {receiveText}</Trans>
      {tokenSymbol && tokenAddress && (
        <div>
          <Trans>
            or{' '}
            <Tooltip
              title={
                <AMMPrices
                  tokenSymbol={tokenSymbol}
                  tokenAddress={tokenAddress}
                />
              }
              placement="bottomLeft"
              overlayStyle={{ minWidth: '300px' }}
              overlayInnerStyle={{ padding: '1rem' }}
            >
              <span
                style={{
                  color: colors.text.action.primary,
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                }}
              >
                buy {tokenText} on exchange
                <TooltipIcon iconStyle={{ marginLeft: '0.2rem' }} />
              </span>
            </Tooltip>
          </Trans>
        </div>
      )}
    </div>
  )
}
