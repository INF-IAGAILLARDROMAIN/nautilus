import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

/**
 * Service de génération de PDF — devis et factures.
 *
 * Utilise pdfkit (programmatique, pas de Chrome embarqué) : léger, rapide,
 * déployable sur Vercel/Railway sans souci de binaire.
 *
 * Le rendu est volontairement A4 portrait, sobre, avec :
 *   - en-tête atelier (à terme personnalisable par compte)
 *   - bloc "DEVIS N° ..." ou "FACTURE N° ..."
 *   - bloc client + bateau
 *   - tableau des lignes
 *   - totaux HT / TVA / TTC
 *   - mentions légales FR (validité, modalités, conditions générales)
 */

// Types minimaux pour le devis qu'on reçoit en entrée
type DevisLigne = {
  description: string;
  quantite: number | string;
  prixUnitaireHT: number | string;
  totalLigneHT: number | string;
};

type DevisClient = {
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
};

type DevisBateau = {
  marque: string;
  modele: string;
  nom?: string | null;
  marqueMoteur?: string | null;
  modeleMoteur?: string | null;
  puissanceCV?: number | null;
  immatriculation?: string | null;
};

export type DevisPdfInput = {
  numeroDevis: string;
  description?: string | null;
  createdAt: Date;
  dateValidite?: Date | null;
  modalitesPaiement?: string | null;
  totalHT: number | string;
  tauxTVA: number | string;
  totalTTC: number | string;
  lignes: DevisLigne[];
  client: DevisClient;
  bateau?: DevisBateau | null;
};

export type FacturePdfInput = DevisPdfInput & {
  numeroFacture: string;
};

export type OrPdfInput = {
  numeroOr?: string; // optionnel — peut être l'ID si pas de numéro métier
  numeroDevis: string;
  type: string; // ENTRETIEN / REPARATION / HIVERNAGE / DESHIVERNAGE / DEPANNAGE
  urgence: string; // NORMAL / URGENT
  mecano?: string | null;
  description?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  createdAt: Date;
  lignes: DevisLigne[];
  client: DevisClient;
  bateau?: DevisBateau | null;
};

@Injectable()
export class PdfService {
  // ---------- API publique ----------

  async genererDevisPdf(devis: DevisPdfInput): Promise<Buffer> {
    return this.genererDocument(devis, 'DEVIS', devis.numeroDevis);
  }

  async genererFacturePdf(facture: FacturePdfInput): Promise<Buffer> {
    return this.genererDocument(facture, 'FACTURE', facture.numeroFacture);
  }

  /**
   * PDF d'ORDRE DE RÉPARATION : document INTERNE imprimé par le mécano
   * pour avoir le travail à effectuer sous les yeux pendant l'intervention.
   * Pas de mentions légales (interne), pas de RGPD (déjà sur le devis).
   * À la place : cases à cocher + zone observations + signature mécano.
   */
  async genererOrPdf(or: OrPdfInput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `OR ${or.numeroDevis}`,
          Author: 'Nautilus',
          Creator: 'Nautilus — Atelier nautique',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        this.dessinerEnteteOr(doc, or);
        this.dessinerBateauOr(doc, or);
        this.dessinerInfosAtelier(doc, or);
        this.dessinerTravauxACocher(doc, or);
        this.dessinerObservationsEtSignature(doc);
        doc.end();
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  // ---------- Implémentation ----------

  private genererDocument(
    data: DevisPdfInput,
    type: 'DEVIS' | 'FACTURE',
    numero: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `${type} ${numero}`,
          Author: 'Nautilus',
          Creator: 'Nautilus — Atelier nautique',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        this.dessinerEntete(doc, type, numero, data);
        this.dessinerClientBateau(doc, data);
        this.dessinerTableauLignes(doc, data);
        this.dessinerTotaux(doc, data);
        this.dessinerMentionsLegales(doc, type, data);
        doc.end();
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  // ---------- Sections ----------

  private dessinerEntete(
    doc: PDFKit.PDFDocument,
    type: 'DEVIS' | 'FACTURE',
    numero: string,
    data: DevisPdfInput,
  ): void {
    // Logo / nom atelier (V1 = juste le texte, V2 = vraie image PNG).
    // Pas d'emoji ⚓ ici : Helvetica est ASCII étendu, pas Unicode emoji.
    doc
      .fontSize(20)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('NAUTILUS', 40, 40)
      .fontSize(9)
      .fillColor('#666')
      .font('Helvetica')
      .text('Atelier nautique — Spécialiste hors-bord', 40, 65)
      .text('Port de plaisance · ZZ000 Ville-Type', 40, 78)
      .text('contact@nautilus.atelier · 06 XX XX XX XX', 40, 91);

    // Numéro de document à droite
    doc
      .fontSize(16)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text(`${type} N°`, 400, 40, { width: 155, align: 'right' })
      .fontSize(14)
      .fillColor('#000')
      .text(numero, 400, 60, { width: 155, align: 'right' })
      .fontSize(9)
      .fillColor('#666')
      .font('Helvetica')
      .text(
        `Émis le ${this.formatDate(data.createdAt)}`,
        400,
        82,
        { width: 155, align: 'right' },
      );

    if (type === 'DEVIS' && data.dateValidite) {
      doc.text(
        `Valide jusqu'au ${this.formatDate(data.dateValidite)}`,
        400,
        95,
        { width: 155, align: 'right' },
      );
    }

    // Trait de séparation
    doc
      .strokeColor('#0f4c5c')
      .lineWidth(1.5)
      .moveTo(40, 120)
      .lineTo(555, 120)
      .stroke();
  }

  private dessinerClientBateau(
    doc: PDFKit.PDFDocument,
    data: DevisPdfInput,
  ): void {
    const yStart = 140;

    // Bloc CLIENT (gauche)
    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('CLIENT', 40, yStart)
      .fillColor('#000')
      .fontSize(11)
      .text(
        `${data.client.nom.toUpperCase()} ${data.client.prenom}`,
        40,
        yStart + 14,
      )
      .fontSize(9)
      .fillColor('#333')
      .font('Helvetica');

    let yClient = yStart + 30;
    if (data.client.adresse) {
      doc.text(data.client.adresse, 40, yClient);
      yClient += 12;
    }
    if (data.client.codePostal || data.client.ville) {
      doc.text(
        `${data.client.codePostal ?? ''} ${data.client.ville ?? ''}`.trim(),
        40,
        yClient,
      );
      yClient += 12;
    }
    if (data.client.email) {
      doc.text(data.client.email, 40, yClient);
      yClient += 12;
    }
    if (data.client.telephone) {
      doc.text(data.client.telephone, 40, yClient);
    }

    // Bloc BATEAU (droite)
    if (data.bateau) {
      doc
        .fontSize(9)
        .fillColor('#0f4c5c')
        .font('Helvetica-Bold')
        .text('BATEAU', 320, yStart)
        .fillColor('#000')
        .fontSize(11);

      const titreBateau = data.bateau.nom
        ? `« ${data.bateau.nom} » — ${data.bateau.marque} ${data.bateau.modele}`
        : `${data.bateau.marque} ${data.bateau.modele}`;
      doc.text(titreBateau, 320, yStart + 14, { width: 235 });

      doc.fontSize(9).fillColor('#333').font('Helvetica');
      let yBateau = yStart + 32;
      if (data.bateau.marqueMoteur || data.bateau.modeleMoteur) {
        const moteur =
          `Moteur ${data.bateau.marqueMoteur ?? '?'} ${data.bateau.modeleMoteur ?? ''}`.trim() +
          (data.bateau.puissanceCV ? ` · ${data.bateau.puissanceCV} CV` : '');
        doc.text(moteur, 320, yBateau);
        yBateau += 12;
      }
      if (data.bateau.immatriculation) {
        doc.text(`Immat. ${data.bateau.immatriculation}`, 320, yBateau);
      }
    }
  }

  private dessinerTableauLignes(
    doc: PDFKit.PDFDocument,
    data: DevisPdfInput,
  ): void {
    const yStart = 240;

    // En-tête tableau
    doc
      .fillColor('#0f4c5c')
      .rect(40, yStart, 515, 22)
      .fill()
      .fillColor('#fff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Désignation', 50, yStart + 7, { width: 280 })
      .text('Qté', 335, yStart + 7, { width: 40, align: 'right' })
      .text('PU HT', 385, yStart + 7, { width: 70, align: 'right' })
      .text('Total HT', 465, yStart + 7, { width: 80, align: 'right' });

    // Lignes
    let y = yStart + 28;
    doc.fillColor('#000').font('Helvetica').fontSize(10);

    data.lignes.forEach((ligne, idx) => {
      const rowHeight = 22;
      // Alternance gris très léger
      if (idx % 2 === 0) {
        doc.fillColor('#f7f7f7').rect(40, y - 2, 515, rowHeight).fill();
      }

      doc
        .fillColor('#000')
        .text(ligne.description, 50, y + 4, { width: 280 })
        .text(this.formatNombre(ligne.quantite), 335, y + 4, {
          width: 40,
          align: 'right',
        })
        .text(this.formatEuro(ligne.prixUnitaireHT), 385, y + 4, {
          width: 70,
          align: 'right',
        })
        .font('Helvetica-Bold')
        .text(this.formatEuro(ligne.totalLigneHT), 465, y + 4, {
          width: 80,
          align: 'right',
        })
        .font('Helvetica');

      y += rowHeight;
    });

    // Sauvegarde de la position Y pour la suite
    (doc as PDFKit.PDFDocument & { _currentY: number })._currentY = y + 10;
  }

  private dessinerTotaux(
    doc: PDFKit.PDFDocument,
    data: DevisPdfInput,
  ): void {
    const docAny = doc as PDFKit.PDFDocument & { _currentY: number };
    let y = docAny._currentY ?? 400;

    const totalHT = Number(data.totalHT);
    const tauxTVA = Number(data.tauxTVA);
    const totalTTC = Number(data.totalTTC);
    const montantTVA = Math.round((totalTTC - totalHT) * 100) / 100;

    doc.fontSize(10).font('Helvetica');

    // Total HT
    doc
      .fillColor('#666')
      .text('Total HT', 380, y, { width: 90, align: 'right' })
      .fillColor('#000')
      .text(this.formatEuro(totalHT), 475, y, { width: 70, align: 'right' });
    y += 16;

    // TVA
    doc
      .fillColor('#666')
      .text(`TVA (${tauxTVA}%)`, 380, y, { width: 90, align: 'right' })
      .fillColor('#000')
      .text(this.formatEuro(montantTVA), 475, y, {
        width: 70,
        align: 'right',
      });
    y += 16;

    // Trait
    doc.strokeColor('#0f4c5c').lineWidth(0.5).moveTo(380, y).lineTo(545, y).stroke();
    y += 6;

    // Total TTC
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#0f4c5c')
      .text('Total TTC', 380, y, { width: 90, align: 'right' })
      .fillColor('#000')
      .text(this.formatEuro(totalTTC), 470, y, { width: 75, align: 'right' });

    docAny._currentY = y + 30;
  }

  private dessinerMentionsLegales(
    doc: PDFKit.PDFDocument,
    type: 'DEVIS' | 'FACTURE',
    data: DevisPdfInput,
  ): void {
    const docAny = doc as PDFKit.PDFDocument & { _currentY: number };
    let y = docAny._currentY ?? 540;

    // ---- Objet (si rempli) -----------------------------------------------
    if (data.description) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0f4c5c')
        .text('Objet', 40, y);
      y += 12;
      doc
        .font('Helvetica')
        .fillColor('#000')
        .text(data.description, 40, y, { width: 515 });
      y = doc.y + 10;
    }

    // ---- Modalités de paiement (si renseignées) --------------------------
    if (data.modalitesPaiement) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#0f4c5c')
        .text('Modalités de paiement', 40, y);
      y += 12;
      doc
        .font('Helvetica')
        .fillColor('#000')
        .text(data.modalitesPaiement, 40, y, { width: 515 });
      y = doc.y + 10;
    }

    // ---- Mention RGPD (obligation d'information, art. 13) ----------------
    doc
      .fontSize(7)
      .fillColor('#666')
      .font('Helvetica-Oblique')
      .text(
        "Information RGPD : vos données sont collectées et utilisées uniquement pour l'établissement de ce " +
          (type === 'DEVIS' ? 'devis' : 'facture') +
          ' et le suivi de la prestation. Conservation : 10 ans (obligation comptable, art. L123-22 C. com.). ' +
          "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données — contact : contact@nautilus.atelier.",
        40,
        y,
        { width: 515, align: 'justify' },
      );
    y = doc.y + 12;

    // ---- Zone signature (DEVIS uniquement) -------------------------------
    // Un devis non signé = simple proposition commerciale. Signé + mention
    // manuscrite "Bon pour accord" = contrat opposable au client.
    if (type === 'DEVIS') {
      const sigY = Math.max(y, 670); // colle au-dessus du footer
      const colW = 250;
      const colH = 70;

      // Cadre atelier (gauche)
      doc
        .strokeColor('#999')
        .lineWidth(0.5)
        .rect(40, sigY, colW, colH)
        .stroke();
      doc
        .fontSize(8)
        .fillColor('#0f4c5c')
        .font('Helvetica-Bold')
        .text("L'ATELIER", 48, sigY + 6)
        .fontSize(7)
        .fillColor('#666')
        .font('Helvetica')
        .text('Date :', 48, sigY + 20)
        .text('Signature + cachet :', 48, sigY + 36);

      // Cadre client (droite)
      doc
        .strokeColor('#999')
        .lineWidth(0.5)
        .rect(305, sigY, colW, colH)
        .stroke();
      doc
        .fontSize(8)
        .fillColor('#0f4c5c')
        .font('Helvetica-Bold')
        .text('LE CLIENT', 313, sigY + 6)
        .fontSize(7)
        .fillColor('#666')
        .font('Helvetica')
        .text('Date :', 313, sigY + 20)
        .text('Faire précéder la signature de la mention manuscrite', 313, sigY + 32, {
          width: 240,
        })
        .font('Helvetica-Bold')
        .text('« Bon pour accord »', 313, sigY + 44);
    }

    // ---- Footer fixé en bas (raison sociale + mentions légales) ----------
    const footerY = 770;

    // Trait de séparation footer
    doc
      .strokeColor('#0f4c5c')
      .lineWidth(0.3)
      .moveTo(40, footerY - 6)
      .lineTo(555, footerY - 6)
      .stroke();

    doc
      .fontSize(7)
      .fillColor('#888')
      .font('Helvetica')
      .text(
        'Nautilus · Atelier nautique · Port de plaisance · ZZ000 Ville-Type',
        40,
        footerY,
        { width: 515, align: 'center' },
      )
      .text(
        'SIRET [à compléter] · N° TVA intracommunautaire [à compléter] · Forme juridique [à compléter] · Assurance RC pro [à compléter]',
        40,
        footerY + 10,
        { width: 515, align: 'center' },
      )
      .font('Helvetica-Oblique')
      .text(
        type === 'DEVIS'
          ? "Devis valable selon date de validité indiquée — bon pour accord client requis avant exécution. TVA non applicable, art. 293 B du CGI si applicable."
          : 'Facture — règlement à réception sauf accord particulier. Pénalités de retard : 3× taux légal. Indemnité forfaitaire recouvrement 40 € (art. L441-10 C. com.). Pas d\'escompte pour règlement anticipé.',
        40,
        footerY + 20,
        { width: 515, align: 'center' },
      );
  }

  // ---------- Sections PDF OR (document interne) ----------

  private dessinerEnteteOr(doc: PDFKit.PDFDocument, or: OrPdfInput): void {
    doc
      .fontSize(20)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('NAUTILUS', 40, 40)
      .fontSize(11)
      .fillColor('#000')
      .text('ORDRE DE RÉPARATION', 40, 65);

    // Cartouche type/urgence à droite
    doc
      .fontSize(9)
      .fillColor('#666')
      .font('Helvetica')
      .text(`Devis lié`, 380, 40, { width: 175, align: 'right' })
      .fontSize(14)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(or.numeroDevis, 380, 53, { width: 175, align: 'right' });

    // Badge type + urgence
    const typeLabel = this.libelleType(or.type);
    const urgenceLabel = or.urgence === 'URGENT' ? '🔴 URGENT' : 'Normal';
    const couleurUrgence = or.urgence === 'URGENT' ? '#dc2626' : '#666';

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text(`Type : `, 380, 80, { width: 175, align: 'right', continued: false })
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(typeLabel, 380, 80, { width: 175, align: 'right' });

    doc
      .fontSize(10)
      .fillColor('#666')
      .font('Helvetica')
      .text('Urgence : ', 380, 95, {
        width: 175,
        align: 'right',
        continued: false,
      })
      .fillColor(couleurUrgence)
      .font('Helvetica-Bold')
      .text(urgenceLabel, 380, 95, { width: 175, align: 'right' });

    // Trait
    doc
      .strokeColor('#0f4c5c')
      .lineWidth(1.5)
      .moveTo(40, 120)
      .lineTo(555, 120)
      .stroke();
  }

  private dessinerBateauOr(doc: PDFKit.PDFDocument, or: OrPdfInput): void {
    const yStart = 140;

    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('BATEAU', 40, yStart);

    if (or.bateau) {
      const titre = or.bateau.nom
        ? `« ${or.bateau.nom} » — ${or.bateau.marque} ${or.bateau.modele}`
        : `${or.bateau.marque} ${or.bateau.modele}`;
      doc
        .fontSize(12)
        .fillColor('#000')
        .text(titre, 40, yStart + 14, { width: 515 });

      doc.fontSize(9).fillColor('#333').font('Helvetica');
      let y = yStart + 34;
      if (or.bateau.marqueMoteur || or.bateau.modeleMoteur) {
        const moteur =
          `Moteur ${or.bateau.marqueMoteur ?? '?'} ${or.bateau.modeleMoteur ?? ''}`.trim() +
          (or.bateau.puissanceCV ? ` · ${or.bateau.puissanceCV} CV` : '');
        doc.text(moteur, 40, y);
        y += 12;
      }
      if (or.bateau.immatriculation) {
        doc.text(`Immat. ${or.bateau.immatriculation}`, 40, y);
      }
    } else {
      doc
        .fontSize(10)
        .fillColor('#666')
        .font('Helvetica-Oblique')
        .text('Aucun bateau associé (cas pré-vente ou accessoires)', 40, yStart + 14);
    }

    // Client à droite
    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('CLIENT', 320, yStart)
      .fontSize(11)
      .fillColor('#000')
      .text(
        `${or.client.nom.toUpperCase()} ${or.client.prenom}`,
        320,
        yStart + 14,
        { width: 235 },
      );

    doc.fontSize(9).fillColor('#333').font('Helvetica');
    let yC = yStart + 32;
    if (or.client.telephone) {
      doc.text(or.client.telephone, 320, yC);
      yC += 12;
    }
    if (or.client.email) {
      doc.text(or.client.email, 320, yC);
    }
  }

  private dessinerInfosAtelier(doc: PDFKit.PDFDocument, or: OrPdfInput): void {
    const yStart = 230;

    // Cadre infos atelier
    doc
      .strokeColor('#999')
      .lineWidth(0.5)
      .rect(40, yStart, 515, 60)
      .stroke();

    // Mécano
    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('MÉCANO ASSIGNÉ', 50, yStart + 8)
      .fontSize(12)
      .fillColor('#000')
      .text(or.mecano ?? '[Non assigné]', 50, yStart + 22);

    // Date début
    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('DATE DÉBUT', 240, yStart + 8)
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica')
      .text(this.formatDate(or.dateDebut ?? null) || '____/____/______', 240, yStart + 22);

    // Date fin
    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('DATE FIN', 400, yStart + 8)
      .fontSize(11)
      .fillColor('#000')
      .font('Helvetica')
      .text(this.formatDate(or.dateFin ?? null) || '____/____/______', 400, yStart + 22);

    // Description si présente
    if (or.description) {
      doc
        .fontSize(9)
        .fillColor('#666')
        .font('Helvetica-Oblique')
        .text(`Note : ${or.description}`, 50, yStart + 42, { width: 495 });
    }
  }

  private dessinerTravauxACocher(
    doc: PDFKit.PDFDocument,
    or: OrPdfInput,
  ): void {
    const yStart = 310;

    doc
      .fontSize(11)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('TRAVAUX À EFFECTUER', 40, yStart);

    doc
      .fontSize(8)
      .fillColor('#666')
      .font('Helvetica-Oblique')
      .text('Cochez chaque étape une fois réalisée', 40, yStart + 14);

    let y = yStart + 35;
    doc.fontSize(11).fillColor('#000').font('Helvetica');

    or.lignes.forEach((ligne) => {
      // Case à cocher
      doc
        .strokeColor('#0f4c5c')
        .lineWidth(1)
        .rect(40, y - 2, 12, 12)
        .stroke();

      // Texte
      doc
        .fillColor('#000')
        .text(
          `${ligne.description}  ·  Qté ${this.formatNombre(ligne.quantite)}`,
          60,
          y,
          { width: 495 },
        );

      y += 22;
    });

    // Sauvegarde Y pour la suite
    (doc as PDFKit.PDFDocument & { _currentY: number })._currentY = y + 20;
  }

  private dessinerObservationsEtSignature(doc: PDFKit.PDFDocument): void {
    const docAny = doc as PDFKit.PDFDocument & { _currentY: number };
    const y = docAny._currentY ?? 550;

    // Zone observations
    doc
      .fontSize(11)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('OBSERVATIONS DU MÉCANO', 40, y);

    // 5 lignes pour écrire
    const lineY = y + 22;
    const lineHeight = 22;
    for (let i = 0; i < 5; i++) {
      doc
        .strokeColor('#ccc')
        .lineWidth(0.3)
        .moveTo(40, lineY + i * lineHeight)
        .lineTo(555, lineY + i * lineHeight)
        .stroke();
    }

    // Zone signature mécano en bas
    const sigY = 740;
    doc
      .fontSize(9)
      .fillColor('#0f4c5c')
      .font('Helvetica-Bold')
      .text('Signature mécano :', 40, sigY)
      .strokeColor('#000')
      .lineWidth(0.5)
      .moveTo(140, sigY + 10)
      .lineTo(400, sigY + 10)
      .stroke();

    doc
      .fontSize(7)
      .fillColor('#888')
      .font('Helvetica-Oblique')
      .text(
        'Document interne Nautilus — Atelier nautique',
        40,
        sigY + 30,
        { width: 515, align: 'center' },
      );
  }

  private libelleType(type: string): string {
    switch (type) {
      case 'ENTRETIEN':
        return 'Entretien';
      case 'REPARATION':
        return 'Réparation';
      case 'HIVERNAGE':
        return 'Hivernage';
      case 'DESHIVERNAGE':
        return 'Déshivernage';
      case 'DEPANNAGE':
        return 'Dépannage';
      default:
        return type;
    }
  }

  // ---------- Helpers de formatage ----------

  private formatEuro(value: number | string): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return n.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  }

  private formatNombre(value: number | string): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    // Affiche en entier si entier, sinon avec 2 décimales
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
