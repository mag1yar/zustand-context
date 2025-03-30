import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import UndrawDocusaurusMountain from '@site/static/img/undraw_docusaurus_mountain.svg';
import UndrawDocusaurusTree from '@site/static/img/undraw_docusaurus_tree.svg';
import UndrawDocusaurusReact from '@site/static/img/undraw_docusaurus_react.svg';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Context-Aware State',
    Svg: UndrawDocusaurusMountain,
    description: (
      <>
        Enjoy the simplicity of Zustand with the power of React Context. Isolate state to specific
        component trees while maintaining Zustand's efficient update model.
      </>
    ),
  },
  {
    title: 'Multiple Nested Providers',
    Svg: UndrawDocusaurusTree,
    description: (
      <>
        Create isolated state instances with <code>instanceId</code> and access them with{' '}
        <code>from()</code>. Perfect for dashboards, complex forms, and multi-tenant UIs.
      </>
    ),
  },
  {
    title: 'TypeScript First',
    Svg: UndrawDocusaurusReact,
    description: (
      <>
        Built with full TypeScript support, including DeepPartial types for initialState,
        strongly-typed selectors, and comprehensive type definitions.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
