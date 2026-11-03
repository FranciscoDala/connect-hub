// src/components/seccoes/CeoSection.tsx
const siteUrl = "https://connect-uuo9.onrender.com";

export default function CeoSection() {
    const ceoImage = `${siteUrl}/team/ceo.jpeg`;
    const orgLogo = `${siteUrl}/connect.png`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Francisco J.M Dala",
        "jobTitle": "CEO & Fundador",
        "image": ceoImage,
        "url": `${siteUrl}/#equipe`,
        "worksFor": {
            "@type": "Organization",
            "name": "CONNECT",
            "url": siteUrl,
            "logo": orgLogo
        },
        "description": "Francisco J.M Dala é Fundador e CEO da Connect Tics, com formação em Engenharia Informática e 5+ anos de liderança em tecnologia em Angola."
    };

    return (
        <>
            <section id="ceo-connect" className="sr-only" aria-label="Perfil do CEO da CONNECT">
                <div className="mx-auto max-w-7xl px-5">
                    <img src="/team/ceo.jpeg" alt="Francisco J.M Dala - CEO CONNECT" width={200} height={200} />
                    <h2>Francisco J.M Dala - CEO & Fundador da CONNECT</h2>
                </div>
            </section>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </>
    );
}
