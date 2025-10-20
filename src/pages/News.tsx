import React from 'react'
import { Helmet } from 'react-helmet'

export default function News() {
    return (
        <>
            <Helmet>
                <title>الأخبار - كنيسة الأنبا رويس بكفر فرج</title>
                <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
                <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
                <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
            </Helmet>
            <iframe
                src="https://copticorthodox.church/daily-news/"
                className='w-full h-screen'
                title="Embedded page"
                sandbox="allow-same-origin allow-scripts allow-forms"
                referrerPolicy="no-referrer"
                loading="lazy"
                style={{ border: 'none' }}
            />
        </>
    )
}
