import React from 'react';
import ConfessionBooking from '../components/ConfessionBooking';
import { Helmet } from 'react-helmet';

const Confession: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>الأعترافات | كنيسة الأنبا رويس بكفر فرج</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
      </Helmet>
      <ConfessionBooking />
    </>
  );
};

export default Confession;