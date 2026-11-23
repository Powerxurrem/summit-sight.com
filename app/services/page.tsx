import type { Metadata } from "next";
import Link from "next/link";
import { services } from "../lib/content";
import { Arrow, ProjectCTA } from "../components/brand";
import { ServiceVisual } from "../components/service-visuals";
import styles from "../components/service-visuals.module.css";
import "../components/secondary.css";

export const metadata: Metadata = { title:"Services",description:"Premium product photography and AI imagery, 360° product visuals, cinematic video and post-production from Summit Sight." };
export default function Services() {
  return <main id="main">
    <section className="page-container page-intro">
      <p className="eyebrow">WHAT WE CREATE / OUR SERVICES</p>
      <h1>Your vision.<br/><em>New possibilities.</em></h1>
      <p>Thoughtful imagery. Considered motion. The finishing details.<br/>Creative production shaped around your product and your brief.</p>
      <nav className="detail-service-nav" aria-label="Services on this page">
        {services.map(service => <a key={service.id} href={`#${service.id}`}><span>{service.number}</span>{service.shortTitle}<Arrow diagonal/></a>)}
      </nav>
    </section>
    <div className="page-container">
      {services.map(service => <section className="detail-service" id={service.id} key={service.id} aria-labelledby={`${service.id}-title`}>
        <div className="detail-service-heading"><p className="eyebrow">SERVICE / {service.number}</p><h2 id={`${service.id}-title`}>{service.title}</h2></div>
        <div className={`detail-service-grid ${styles.grid}`}>
          <ServiceVisual service={service.id}/>
          <div className="detail-service-body">
            <p className="detail-service-description">{service.description}</p>
            <ul className="detail-capabilities">{service.capabilities.map(capability => <li key={capability}><span aria-hidden="true">↗</span>{capability}</li>)}</ul>
            <dl className="detail-service-facts">
              <div><dt>Where it works</dt><dd>{service.applications}</dd></div>
              <div><dt>What we start with</dt><dd>{service.inputs}</dd></div>
              <div><dt>What you receive</dt><dd>{service.deliverables}</dd></div>
            </dl>
            <div className="detail-actions">
              <Link className="text-link" href={`/contact?service=${service.id}`}>Discuss a project <Arrow diagonal/></Link>
              <Link className="text-link" href={service.studyHref}>Explore a study <Arrow diagonal/></Link>
            </div>
          </div>
        </div>
      </section>)}
      <aside className="detail-development"><p className="eyebrow">ON THE HORIZON</p><div>
        <span className="detail-status">IN DEVELOPMENT</span><h3>New ways to see your product.</h3>
        <p>Advanced 3D product reconstruction is an area of ongoing exploration. It is not currently offered as a standard production service. If your brief calls for something experimental, let’s discuss what is possible.</p>
      </div></aside>
    </div>
    <ProjectCTA/>
  </main>;
}
