import { gql, useQuery } from '@apollo/client';

const GET_PRICELIST = gql`
    query {
    priceList {
        extraction
        sampleQC
        serviceCost
        libraryPreparation_per_sample {
            kit {
                name
                price
            }
        }
        libraryQC
        sequencing_per_gb {
            illumina
            mgi
            nanopore
            pacbio
            hic
        }
        logistics
        dataAnalysis {
            standard
            interpretation
        }
        profitPercentage
        gstPercentage
        bulkdiscount {
            category {
                name
                minSample
                maxSample
                discount
            }
        }
        additionalDiscount
    }
    }
`;

// Custom hook to fetch price list data
export function usePriceList() {
    const { data, loading, error } = useQuery(GET_PRICELIST);
    return { priceList: data?.priceList, loading, error };
}

// Pure function to calculate price based on service and form data
export function calculatePrice(serviceTitle: string, formData: any, priceList: any) {
    if (!priceList) return 0;
    let totalPrice = 0;
    
    
    // Check if servicesRequired includes specific services
    if (formData.servicesRequired?.includes("Extraction")) {
        totalPrice += Number(priceList.extraction) * Number(formData.numberOfSamples) || 0;
    }

    if (formData.servicesRequired?.includes("Extraction") || formData.servicesRequired?.includes("Library Preparation")) {
        totalPrice += Number(priceList.sampleQC) * Number(formData.numberOfSamples) || 0;
    }

    if (formData.servicesRequired?.includes("Library Preparation")) {
        let kitName = formData.kitName;
        let kitPrice = priceList.libraryPreparation_per_sample.kit.find((k: any) => k.name === kitName)?.price;
        if (kitPrice) {
            totalPrice += Number(kitPrice) * Number(formData.numberOfSamples) || 0;
        }
        totalPrice += Number(priceList.serviceCost) * Number(formData.numberOfSamples) || 0;
        totalPrice += Number(priceList.libraryQC) * Number(formData.numberOfSamples) || 0;
    }

    if (formData.servicesRequired?.includes("Library-QC")) {
        totalPrice += Number(priceList.libraryQC) || 0;
    }
    
    if (formData.servicesRequired?.includes("Sequencing") && serviceTitle !== "Genome Assembly") {
        let sampleSize = Number(formData.numberOfSamples) || 0;
        let platformPrice = 0;
        // Access the first item of the array since it's coming as an array
        const sequencingPrices = Array.isArray(priceList.sequencing_per_gb) 
            ? priceList.sequencing_per_gb[0] 
            : priceList.sequencing_per_gb;
            
        if (formData.sequencingPlatform === "Illumina") {
            platformPrice = Number(sequencingPrices.illumina) || 0;
        } else if (formData.sequencingPlatform === "MGI") {
            platformPrice = Number(sequencingPrices.mgi) || 0;
        } else if (formData.sequencingPlatform === "PacBio") {
            platformPrice = Number(sequencingPrices.pacbio) || 0;
        } else if (formData.sequencingPlatform === "Nanopore") {
            platformPrice = Number(sequencingPrices.nanopore) || 0;
        }
        
        let basesRequired = formData.basesRequired === "other" ? formData.basesRequiredOther : formData.basesRequired;
        let readsRequired = formData.readRequired === "other" ? formData.readRequiredOther : formData.readRequired;
        basesRequired = Number(basesRequired) || 0;
        readsRequired = Number(readsRequired) || 0;
        
        if (basesRequired === 0) {
            basesRequired = (readsRequired * 150) / 1000;
        }

      
        
        const sequencingCost = platformPrice * basesRequired * sampleSize;  
        totalPrice += sequencingCost;
    }

    if (serviceTitle === "Genome Assembly") {
        let sampleSize = Number(formData.numberOfSamples) || 0;
        let shortReadBaseRequired = formData.shortReadBaseRequired;
        let longReadBaseRequired = formData.longReadBaseRequired;
        let platformPrice = 0;

        if (formData.shortRead === "Illumina") {
            platformPrice += Number(priceList.genomeAssembly_per_sample.illumina) * shortReadBaseRequired * sampleSize;
        } else if (formData.shortRead === "MGI") {
            platformPrice += Number(priceList.genomeAssembly_per_sample.mgi) * shortReadBaseRequired * sampleSize;
        }

        if (formData.longRead === "PacBio") {
            platformPrice += Number(priceList.genomeAssembly_per_sample.pacbio) * longReadBaseRequired * sampleSize;
        } else if (formData.longRead === "Nanopore") {
            platformPrice += Number(priceList.genomeAssembly_per_sample.nanopore) * longReadBaseRequired * sampleSize;
        }

        // adding HiC as its compulsory
        platformPrice += Number(priceList.genomeAssembly_per_sample.hic) * longReadBaseRequired * sampleSize;

        
        totalPrice += platformPrice;
    }
    
    if (formData.servicesRequired?.includes("Data Analysis")) {
        if (formData.dataAnalysis === "standard") {
            totalPrice += Number(priceList.dataAnalysis.standard) * Number(formData.numberOfSamples) || 0;
        } else if (formData.dataAnalysis === "advanced") {
            totalPrice += (Number(priceList.dataAnalysis.standard) + Number(priceList.dataAnalysis.interpretation)) * Number(formData.numberOfSamples) || 0;
        }
    }
    
    // Add logistics cost (only if Data Analysis is not selected)
    let logisticsCost = formData.servicesRequired === "Data Analysis" ? 0 : Number(priceList.logistics) || 0;
    totalPrice += logisticsCost;
    
    // Apply bulk discount if applicable
    let bulkDiscount = 0;
    if (formData.numberOfSamples) {
        const numSamples = Number(formData.numberOfSamples) || 0;
        const discountCategory = priceList.bulkdiscount.category.find((category: { minSample: number; maxSample: number; discount: number }) => 
            numSamples >= category.minSample && numSamples <= category.maxSample
        );
        if (discountCategory) {
            totalPrice = totalPrice * (1 - Number(discountCategory.discount) / 100);
            bulkDiscount = discountCategory.discount;
        }
    }

    
    // Apply additional discount if any
    if (priceList.additionalDiscount) {
        totalPrice = totalPrice * (1 - Number(priceList.additionalDiscount) / 100);
    }

    
    // Apply profit percentage and GST
    totalPrice = totalPrice * (1 + Number(priceList.profitPercentage) / 100);
    let priceBeforeGST = totalPrice;
    totalPrice = totalPrice * (1 + Number(priceList.gstPercentage) / 100);

    // round off all prices to integer
    priceBeforeGST = Math.round(priceBeforeGST);
    totalPrice = Math.round(totalPrice);
    
    return { priceBeforeGST, totalPrice, gstPercentage: priceList.gstPercentage, bulkDiscount: bulkDiscount };
}
