import { WORDS_HASHTAG } from './WORDS5';

// Tableau des lettres rares
const LETTRES_RARES: string[] = "PGBVHFQYXJKWZ".split('');

// Fonction pour regrouper les mots par leur 2ème lettre
function regrouper_par_2eme_lettre(mots: string[]): Map<string, string[]> {
    const groupes = new Map<string, string[]>();
    
    for (const mot of mots) {
        const deuxiemeLettre = mot[1];
        if (!groupes.has(deuxiemeLettre)) {
            groupes.set(deuxiemeLettre, []);
        }
        groupes.get(deuxiemeLettre)!.push(mot);
    }
    
    return groupes;
}

// Regroupement initial des mots
const mots_par_l2 = regrouper_par_2eme_lettre(WORDS_HASHTAG);

// Fonction pour imprimer la combinaison
function print_combi(mot1: string, mot2: string, mot3: string, mot4: string): void {
    console.log(` ${mot3[0]} ${mot4[0]}`);
    console.log(mot1);
    console.log(` ${mot3[2]} ${mot4[2]}`);
    console.log(mot2);
    console.log(` ${mot3[4]} ${mot4[4]}`);
}

// Fonction pour compter le nombre de lettres rares
function compter_lettres_rares(lettres: string[]): number {
    return lettres.filter(l => LETTRES_RARES.includes(l)).length;
}

// Type pour la combinaison de mots
type Combination = [string, string, string, string];

// Export the function and types
export type Word = {
  word: string;
  type: 'H1' | 'H2' | 'V1' | 'V2';
};

export function find_combination(): Word[] {
  const [mot1, mot2, mot3, mot4] = find_combination_internal();
  return [
    { word: mot1, type: 'H1' },
    { word: mot2, type: 'H2' },
    { word: mot3, type: 'V1' },
    { word: mot4, type: 'V2' }
  ];
}

// Rename the original function
function find_combination_internal(): Combination {
    let combi_found = false;
    let mot1: string, mot2: string, mot3: string, mot4: string;
    let nb_lr: number;

    while (!combi_found) {
        // Choix mot1
        mot1 = WORDS_HASHTAG[Math.floor(Math.random() * WORDS_HASHTAG.length)];
        
        // Choix mot3
        const mot3_candidats = mots_par_l2.get(mot1[1]) || [];
        mot3 = mot3_candidats[Math.floor(Math.random() * mot3_candidats.length)];
        
        // Choix mot2
        const mot2_candidats = mots_par_l2.get(mot3[3]) || [];
        mot2 = mot2_candidats[Math.floor(Math.random() * mot2_candidats.length)];
        
        // Compter les lettres rares
        const lettres_combi = [...mot1, ...mot2, mot3[0], mot3[2], mot3[4]];
        nb_lr = compter_lettres_rares(lettres_combi);

        if (nb_lr < 2) continue;

        // Groupe des 4eme mots potentiels
        const mots4 = (mots_par_l2.get(mot1[3]) || [])
            .filter(m => m[3] === mot2[3]);

        for (const potential_mot4 of mots4) {
            mot4 = potential_mot4;
            const lettres_mot4 = [mot4[0], mot4[2], mot4[4]];
            nb_lr += compter_lettres_rares(lettres_mot4);

            if (nb_lr >= 3) {
                combi_found = true;
                // print_combi(mot1, mot2, mot3, mot4);
                return [mot1, mot2, mot3, mot4];
            }
        }
    }
    
    // Cette ligne ne devrait jamais être atteinte mais TypeScript l'exige
    throw new Error("Aucune combinaison valide trouvée");
}


