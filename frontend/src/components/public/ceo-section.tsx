// src/components/seccoes/CeoSection.tsx
export default function CeoSection() {
    const ceoImage = "https://connect-uuo9.onrender.com/team/ceo.jpeg"

    const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Francisco J.M Dala",
        "jobTitle": "CEO & Fundador",
        "image": ceoImage,
        "url": "https://connect-uuo9.onrender.com/#equipe",
        "worksFor": {
            "@type": "Organization",
            "name": "CONNECT",
            "url": "https://connect-uuo9.onrender.com/",
            "logo": ceoImage
        },
        "description": "Francisco J.M Dala é Fundador e CEO da Connect Tics, com formação em Engenharia Informática e 5+ anos de liderança em tecnologia em Angola."
    }

    return (
        <>
            <section id="ceo-connect" className="bg-white py-16 border-t border-slate-100 hidden">
                {/* Seção escondida só para SEO - a imagem visual já está no EquipeSection */}
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
    )
}
