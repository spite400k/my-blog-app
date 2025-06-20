'use client'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">私たちについて</h1>

      <p className="mb-4">
        このブログ作成支援サービスは、初心者でも簡単に質の高い記事を作成できるように設計されています。
        AI技術を活用し、タイトルやキーワード、目次、あらすじ、本文の自動生成までを一気通貫でサポートします。
      </p>

      <p className="mb-4">
        私たちの目標は、情報発信をもっと手軽に、そして楽しくすることです。
        文章を書くのが苦手な方でも、テーマに沿ったしっかりした記事を素早く作成できるようにサポートします。
      </p>

      <p className="mb-4">
        使いやすさとシンプルさを追求したUIと、最新のAI技術を組み合わせて、
        あなたのコンテンツ作成を力強く支援します。
      </p>

      <p>
        ご質問やご要望があれば、<a href="/contact" className="text-blue-600 underline">お問い合わせページ</a>からお気軽にご連絡ください。
      </p>
    </div>
  )
}
