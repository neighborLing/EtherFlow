// 交易查询功能演示脚本
// 这个脚本展示了如何使用ethers.js查询交易信息

import { ethers } from 'ethers'

// 示例交易哈希（以太坊主网上的真实交易）
const EXAMPLE_TX_HASH = '0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b'

/**
 * 查询交易信息的完整示例
 * @param {string} txHash - 交易哈希
 * @param {string} rpcUrl - RPC节点URL
 */
async function queryTransaction(txHash, rpcUrl = 'https://eth.llamarpc.com') {
  try {
    console.log('🔍 开始查询交易:', txHash)
    
    // 创建provider
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    // 验证交易哈希格式
    if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
      throw new Error('无效的交易哈希格式')
    }
    
    console.log('✅ 交易哈希格式验证通过')
    
    // 获取交易收据
    console.log('📋 获取交易收据...')
    const receipt = await provider.getTransactionReceipt(txHash)
    if (!receipt) {
      throw new Error('交易不存在或尚未被打包')
    }
    
    // 获取交易详情
    console.log('📄 获取交易详情...')
    const tx = await provider.getTransaction(txHash)
    if (!tx) {
      throw new Error('无法获取交易详情')
    }
    
    // 获取区块信息
    console.log('📦 获取区块信息...')
    const block = await provider.getBlock(receipt.blockNumber)
    
    // 格式化交易数据
    const transactionData = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '合约调用',
      value: ethers.formatEther(tx.value),
      gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
      gasLimit: tx.gasLimit?.toString() || '0',
      nonce: tx.nonce,
      data: tx.data,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      timestamp: block?.timestamp || 0,
      confirmations: receipt.confirmations,
      status: receipt.status === 1 ? '成功' : '失败'
    }
    
    console.log('🎉 交易查询成功!')
    console.log('📊 交易详情:')
    console.log(JSON.stringify(transactionData, null, 2))
    
    return transactionData
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
    throw error
  }
}

/**
 * 批量查询多个交易
 * @param {string[]} txHashes - 交易哈希数组
 */
async function batchQueryTransactions(txHashes) {
  console.log('🚀 开始批量查询交易...')
  
  const results = []
  const errors = []
  
  for (const txHash of txHashes) {
    try {
      const result = await queryTransaction(txHash)
      results.push({ hash: txHash, success: true, data: result })
    } catch (error) {
      errors.push({ hash: txHash, success: false, error: error.message })
    }
  }
  
  console.log('📈 批量查询完成:')
  console.log(`✅ 成功: ${results.length} 个`)
  console.log(`❌ 失败: ${errors.length} 个`)
  
  return { results, errors }
}

/**
 * 验证交易哈希格式
 * @param {string} txHash - 交易哈希
 */
function validateTransactionHash(txHash) {
  const pattern = /^0x([A-Fa-f0-9]{64})$/
  return pattern.test(txHash)
}

/**
 * 格式化交易金额
 * @param {string} value - Wei格式的金额
 * @param {number} decimals - 小数位数
 */
function formatTransactionValue(value, decimals = 6) {
  const ethValue = ethers.formatEther(value)
  return parseFloat(ethValue).toFixed(decimals)
}

// 使用示例
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.queryTransaction = queryTransaction
  window.batchQueryTransactions = batchQueryTransactions
  window.validateTransactionHash = validateTransactionHash
  window.formatTransactionValue = formatTransactionValue
} else {
  // Node.js环境
  console.log('📝 交易查询功能演示')
  console.log('示例交易哈希:', EXAMPLE_TX_HASH)
  
  // 运行示例查询
  queryTransaction(EXAMPLE_TX_HASH)
    .then(data => {
      console.log('✅ 演示完成')
    })
    .catch(error => {
      console.log('❌ 演示失败:', error.message)
    })
}

export {
  queryTransaction,
  batchQueryTransactions,
  validateTransactionHash,
  formatTransactionValue,
  EXAMPLE_TX_HASH
}
