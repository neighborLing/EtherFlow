import RedPacketGrabbing from "../components/RedPacketGrabbing"
import UniswapStyleHeader from "../components/UniswapStyleHeader"

export default function RedPacketPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Uniswap Style Header */}
      <UniswapStyleHeader />
      
      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        <RedPacketGrabbing />
      </div>
    </div>
  )
}