/**
 * Enhanced Intelligence Model for Venturr
 * 
 * Integrates ThomCo dual intelligence architecture with roofing/metal trade industry knowledge base
 * 
 * Architecture:
 * - Talker (System 1): Fast conversational interface for user interactions
 * - Reasoner (System 2): Deep analytical processing using LLM
 * - Multi-Agent Framework: Material analysis, compliance checking, crew planning, risk assessment
 * - Knowledge Graph: Roofing ecosystem modeling (materials, suppliers, codes, methods)
 * - Adaptive Learning: Continuous improvement through feedback loops
 */

import { invokeLLM } from "./_core/llm";

/**
 * Knowledge Base Structure
 */
export interface RoofingKnowledgeBase {
  materials: MaterialsDatabase;
  compliance: ComplianceStandardsLibrary;
  installation: InstallationMethodologyKB;
  crewIntelligence: CrewIntelligenceData;
  riskAssessment: RiskAssessmentFramework;
}

/**
 * Materials Database
 */
export interface MaterialsDatabase {
  metalRoofing: {
    [productId: string]: {
      manufacturer: string;
      productName: string;
      type: "colorbond" | "zincalume" | "custom_orb" | "trimdek" | "spandek" | "monoclad" | "speed_deck" | "megaclad";
      gauge: string; // e.g., "0.42mm", "0.48mm"
      coating: string;
      dimensions: {
        width: number;
        length: number;
        coverage: number; // m²
      };
      properties: {
        windUpliftResistance: string;
        fireRating: string;
        thermalPerformance: string;
        corrosionResistance: string;
      };
      cost: {
        pricePerM2: number;
        currency: string;
      };
      supplier: string;
      certifications: string[];
      compatibility: string[];
      wasteFactor: number; // percentage
    };
  };
  accessories: {
    [accessoryId: string]: {
      name: string;
      type: "fastener" | "flashing" | "ridge_cap" | "gutter" | "downpipe" | "valley" | "penetration";
      material: string;
      specifications: Record<string, any>;
      cost: number;
      unit: string;
    };
  };
}

/**
 * Compliance Standards Library
 */
export interface ComplianceStandardsLibrary {
  australianStandards: {
    "AS 1562.1:2018": {
      title: string;
      scope: string;
      requirements: string[];
      checkpoints: string[];
    };
    "AS/NZS 1170.2:2021": {
      title: string;
      scope: string;
      windLoadCalculations: string[];
      requirements: string[];
    };
    "AS 3959:2018": {
      title: string;
      scope: string;
      bushfireAttackLevels: string[];
      requirements: string[];
    };
    "NCC 2022": {
      title: string;
      scope: string;
      buildingCodeRequirements: string[];
    };
  };
  regionalCodes: {
    [jurisdiction: string]: {
      permitRequirements: string[];
      inspectionCheckpoints: string[];
      specificRequirements: string[];
    };
  };
}

/**
 * Installation Methodology Knowledge Base
 */
export interface InstallationMethodologyKB {
  procedures: {
    [roofType: string]: {
      steps: Array<{
        stepNumber: number;
        description: string;
        safetyProtocol: string;
        qualityCheckpoint: string;
        estimatedTime: number; // minutes
        requiredSkillLevel: "apprentice" | "tradesperson" | "supervisor";
      }>;
      bestPractices: string[];
      commonIssues: Array<{
        issue: string;
        solution: string;
        prevention: string;
      }>;
      equipmentRequired: string[];
    };
  };
  windDesign: {
    calculations: string[];
    considerations: string[];
  };
  waterproofing: {
    methods: string[];
    materials: string[];
    testingProcedures: string[];
  };
}

/**
 * Crew Intelligence Data
 */
export interface CrewIntelligenceData {
  skillLevelRequirements: {
    [jobType: string]: {
      supervisor: number;
      tradesperson: number;
      apprentice: number;
      laborer: number;
    };
  };
  crewSizeRecommendations: {
    [complexity: string]: {
      minCrew: number;
      optimalCrew: number;
      maxCrew: number;
    };
  };
  equipmentRequirements: {
    [jobType: string]: string[];
  };
  timeEstimates: {
    [installationType: string]: {
      baseTime: number; // hours per 100m²
      difficultyMultiplier: Record<string, number>;
    };
  };
}

/**
 * Risk Assessment Framework
 */
export interface RiskAssessmentFramework {
  difficultyIndicators: {
    easy: string[];
    medium: string[];
    hard: string[];
    extreme: string[];
  };
  coastalExposureFactors: {
    corrosionRisk: string[];
    materialSelection: string[];
    maintenanceRequirements: string[];
  };
  weatherImpactFactors: {
    wind: string[];
    rain: string[];
    temperature: string[];
  };
  safetyRiskMatrices: {
    [riskType: string]: {
      likelihood: "low" | "medium" | "high";
      consequence: "minor" | "moderate" | "major" | "catastrophic";
      mitigationStrategies: string[];
    };
  };
}

/**
 * Enhanced Intelligence Model
 */
export class EnhancedIntelligenceModel {
  private knowledgeBase: RoofingKnowledgeBase;

  constructor() {
    this.knowledgeBase = this.initializeKnowledgeBase();
  }

  /**
   * Initialize knowledge base with ThomCo data
   */
  private initializeKnowledgeBase(): RoofingKnowledgeBase {
    return {
      materials: this.loadMaterialsDatabase(),
      compliance: this.loadComplianceStandards(),
      installation: this.loadInstallationMethodology(),
      crewIntelligence: this.loadCrewIntelligence(),
      riskAssessment: this.loadRiskAssessment(),
    };
  }

  /**
   * Load materials database
   */
  private loadMaterialsDatabase(): MaterialsDatabase {
    return {
      metalRoofing: {
        "lysaght-trimdek-042-colorbond": {
          manufacturer: "Lysaght",
          productName: "Trimdek 0.42mm COLORBOND®",
          type: "trimdek",
          gauge: "0.42mm",
          coating: "COLORBOND®",
          dimensions: {
            width: 762,
            length: 0, // custom
            coverage: 690, // mm effective cover
          },
          properties: {
            windUpliftResistance: "High",
            fireRating: "BAL-29",
            thermalPerformance: "Good",
            corrosionResistance: "Excellent",
          },
          cost: {
            pricePerM2: 42,
            currency: "AUD",
          },
          supplier: "Lysaght",
          certifications: ["AS 1562.1:2018", "CodeMark"],
          compatibility: ["Residential", "Commercial", "Industrial"],
          wasteFactor: 10,
        },
        "lysaght-trimdek-048-colorbond": {
          manufacturer: "Lysaght",
          productName: "Trimdek 0.48mm COLORBOND®",
          type: "trimdek",
          gauge: "0.48mm",
          coating: "COLORBOND®",
          dimensions: {
            width: 762,
            length: 0,
            coverage: 690,
          },
          properties: {
            windUpliftResistance: "Very High",
            fireRating: "BAL-40",
            thermalPerformance: "Excellent",
            corrosionResistance: "Excellent",
          },
          cost: {
            pricePerM2: 58,
            currency: "AUD",
          },
          supplier: "Lysaght",
          certifications: ["AS 1562.1:2018", "CodeMark"],
          compatibility: ["Residential", "Commercial", "Industrial", "Coastal"],
          wasteFactor: 10,
        },
        // Add more materials...
      },
      accessories: {
        "ridge-cap-colorbond": {
          name: "Ridge Cap COLORBOND®",
          type: "ridge_cap",
          material: "COLORBOND® Steel",
          specifications: {
            length: 2400,
            coverage: 2300,
          },
          cost: 25,
          unit: "per length",
        },
        // Add more accessories...
      },
    };
  }

  /**
   * Load compliance standards
   */
  private loadComplianceStandards(): ComplianceStandardsLibrary {
    return {
      australianStandards: {
        "AS 1562.1:2018": {
          title: "Design and installation of sheet roof and wall cladding - Metal",
          scope: "Metal roof and wall cladding installation requirements",
          requirements: [
            "Minimum roof pitch requirements",
            "Fastener spacing and type",
            "Flashing and sealing requirements",
            "Structural adequacy",
            "Weatherproofing",
          ],
          checkpoints: [
            "Verify roof pitch meets minimum requirements",
            "Check fastener type and spacing",
            "Inspect flashing installation",
            "Verify structural support",
            "Test weatherproofing",
          ],
        },
        "AS/NZS 1170.2:2021": {
          title: "Structural design actions - Wind actions",
          scope: "Wind load calculations for structures",
          windLoadCalculations: [
            "Regional wind speed",
            "Terrain category",
            "Building height",
            "Roof shape factor",
            "Pressure coefficients",
          ],
          requirements: [
            "Calculate design wind speeds",
            "Determine pressure coefficients",
            "Verify structural adequacy",
            "Check fastener capacity",
          ],
        },
        "AS 3959:2018": {
          title: "Construction of buildings in bushfire-prone areas",
          scope: "Bushfire attack level requirements",
          bushfireAttackLevels: ["BAL-LOW", "BAL-12.5", "BAL-19", "BAL-29", "BAL-40", "BAL-FZ"],
          requirements: [
            "Material selection for BAL rating",
            "Ember protection",
            "Radiant heat protection",
            "Construction details",
          ],
        },
        "NCC 2022": {
          title: "National Construction Code",
          scope: "Building code requirements",
          buildingCodeRequirements: [
            "Structural provisions",
            "Fire safety",
            "Health and amenity",
            "Access and egress",
            "Energy efficiency",
          ],
        },
      },
      regionalCodes: {
        NSW: {
          permitRequirements: ["DA approval", "CDC", "Complying development"],
          inspectionCheckpoints: ["Frame inspection", "Final inspection"],
          specificRequirements: ["BASIX compliance", "Heritage considerations"],
        },
        VIC: {
          permitRequirements: ["Building permit", "Planning permit"],
          inspectionCheckpoints: ["Mandatory inspections", "Final inspection"],
          specificRequirements: ["6 Star energy rating", "Bushfire overlay"],
        },
        QLD: {
          permitRequirements: ["Building approval", "Development approval"],
          inspectionCheckpoints: ["Footing inspection", "Frame inspection", "Final inspection"],
          specificRequirements: ["Cyclone rating", "Termite protection"],
        },
        // Add more jurisdictions...
      },
    };
  }

  /**
   * Load installation methodology
   */
  private loadInstallationMethodology(): InstallationMethodologyKB {
    return {
      procedures: {
        "metal-roof-gable": {
          steps: [
            {
              stepNumber: 1,
              description: "Inspect and prepare roof structure",
              safetyProtocol: "Fall protection, edge protection, PPE",
              qualityCheckpoint: "Verify structural integrity, check for level",
              estimatedTime: 60,
              requiredSkillLevel: "supervisor",
            },
            {
              stepNumber: 2,
              description: "Install sarking and battens",
              safetyProtocol: "Fall protection, tool safety",
              qualityCheckpoint: "Check batten spacing, verify sarking overlap",
              estimatedTime: 120,
              requiredSkillLevel: "tradesperson",
            },
            {
              stepNumber: 3,
              description: "Install valley and flashing",
              safetyProtocol: "Fall protection, sharp edges awareness",
              qualityCheckpoint: "Verify valley alignment, check flashing overlap",
              estimatedTime: 90,
              requiredSkillLevel: "tradesperson",
            },
            {
              stepNumber: 4,
              description: "Install metal roofing sheets",
              safetyProtocol: "Fall protection, lifting safety, wind awareness",
              qualityCheckpoint: "Check sheet alignment, verify fastener spacing",
              estimatedTime: 180,
              requiredSkillLevel: "tradesperson",
            },
            {
              stepNumber: 5,
              description: "Install ridge capping and trim",
              safetyProtocol: "Fall protection, height safety",
              qualityCheckpoint: "Verify ridge cap alignment, check trim fit",
              estimatedTime: 90,
              requiredSkillLevel: "tradesperson",
            },
            {
              stepNumber: 6,
              description: "Final inspection and cleanup",
              safetyProtocol: "Site safety, waste management",
              qualityCheckpoint: "Complete checklist, test weatherproofing",
              estimatedTime: 60,
              requiredSkillLevel: "supervisor",
            },
          ],
          bestPractices: [
            "Work from bottom to top",
            "Ensure proper overlap (minimum 150mm)",
            "Use correct fastener type and spacing",
            "Install in dry conditions",
            "Check weather forecast",
          ],
          commonIssues: [
            {
              issue: "Sheet misalignment",
              solution: "Re-measure and adjust before fastening",
              prevention: "Use string line for alignment",
            },
            {
              issue: "Fastener over-tightening",
              solution: "Replace damaged fasteners",
              prevention: "Use torque-limited tools",
            },
            {
              issue: "Water ingress at flashing",
              solution: "Re-seal with appropriate sealant",
              prevention: "Ensure proper overlap and sealing during installation",
            },
          ],
          equipmentRequired: [
            "Fall protection system",
            "Scaffolding or roof ladder",
            "Power drill with hex head",
            "Metal cutting shears",
            "Measuring tape",
            "String line",
            "Safety harness",
            "Hard hat",
            "Safety glasses",
            "Gloves",
          ],
        },
        // Add more roof types...
      },
      windDesign: {
        calculations: [
          "Regional wind speed (AS/NZS 1170.2)",
          "Terrain category assessment",
          "Building height factor",
          "Roof shape factor",
          "Pressure coefficient calculation",
        ],
        considerations: [
          "Coastal exposure",
          "Topography",
          "Surrounding buildings",
          "Roof pitch",
        ],
      },
      waterproofing: {
        methods: ["Membrane systems", "Liquid applied", "Sheet metal"],
        materials: ["Bituminous membrane", "PVC membrane", "TPO membrane"],
        testingProcedures: ["Water ponding test", "Spray test", "Visual inspection"],
      },
    };
  }

  /**
   * Load crew intelligence
   */
  private loadCrewIntelligence(): CrewIntelligenceData {
    return {
      skillLevelRequirements: {
        "residential-reroof": {
          supervisor: 1,
          tradesperson: 2,
          apprentice: 1,
          laborer: 1,
        },
        "commercial-new": {
          supervisor: 1,
          tradesperson: 3,
          apprentice: 2,
          laborer: 2,
        },
        "industrial-complex": {
          supervisor: 2,
          tradesperson: 4,
          apprentice: 2,
          laborer: 2,
        },
      },
      crewSizeRecommendations: {
        easy: {
          minCrew: 3,
          optimalCrew: 4,
          maxCrew: 5,
        },
        medium: {
          minCrew: 4,
          optimalCrew: 5,
          maxCrew: 7,
        },
        hard: {
          minCrew: 5,
          optimalCrew: 7,
          maxCrew: 10,
        },
        extreme: {
          minCrew: 7,
          optimalCrew: 10,
          maxCrew: 15,
        },
      },
      equipmentRequirements: {
        "metal-roofing": [
          "Scaffolding",
          "Fall protection system",
          "Power tools (drill, saw)",
          "Hand tools (shears, crimpers)",
          "Measuring equipment",
          "Safety equipment (harness, hard hat, gloves)",
        ],
        "tile-roofing": [
          "Scaffolding",
          "Fall protection system",
          "Tile cutter",
          "Mortar mixer",
          "Safety equipment",
        ],
      },
      timeEstimates: {
        "metal-roof-gable": {
          baseTime: 8, // hours per 100m²
          difficultyMultiplier: {
            easy: 1.0,
            medium: 1.3,
            hard: 1.7,
            extreme: 2.5,
          },
        },
        "metal-roof-hip": {
          baseTime: 10,
          difficultyMultiplier: {
            easy: 1.0,
            medium: 1.4,
            hard: 1.9,
            extreme: 3.0,
          },
        },
      },
    };
  }

  /**
   * Load risk assessment framework
   */
  private loadRiskAssessment(): RiskAssessmentFramework {
    return {
      difficultyIndicators: {
        easy: [
          "Simple gable roof",
          "Low pitch (< 15°)",
          "Small area (< 100m²)",
          "Good access",
          "No complex details",
        ],
        medium: [
          "Hip roof",
          "Medium pitch (15-30°)",
          "Medium area (100-200m²)",
          "Moderate access",
          "Some complex details",
        ],
        hard: [
          "Complex roof shape",
          "Steep pitch (30-45°)",
          "Large area (200-500m²)",
          "Difficult access",
          "Multiple complex details",
        ],
        extreme: [
          "Very complex roof",
          "Very steep pitch (> 45°)",
          "Very large area (> 500m²)",
          "Very difficult access",
          "Extensive complex details",
          "Heritage constraints",
        ],
      },
      coastalExposureFactors: {
        corrosionRisk: [
          "Salt spray exposure",
          "High humidity",
          "Marine environment",
        ],
        materialSelection: [
          "Use COLORBOND® or ZINCALUME®",
          "Increase gauge thickness",
          "Use marine-grade fasteners",
          "Apply protective coatings",
        ],
        maintenanceRequirements: [
          "Annual inspections",
          "Regular cleaning",
          "Fastener checks",
          "Coating touch-ups",
        ],
      },
      weatherImpactFactors: {
        wind: [
          "High wind zone",
          "Cyclone-prone area",
          "Exposed location",
        ],
        rain: [
          "High rainfall area",
          "Flood-prone",
          "Poor drainage",
        ],
        temperature: [
          "Extreme heat",
          "Freeze-thaw cycles",
          "Thermal expansion",
        ],
      },
      safetyRiskMatrices: {
        "working-at-height": {
          likelihood: "high",
          consequence: "catastrophic",
          mitigationStrategies: [
            "Fall protection system",
            "Edge protection",
            "Safety harness",
            "Scaffolding",
            "Training",
          ],
        },
        "manual-handling": {
          likelihood: "high",
          consequence: "moderate",
          mitigationStrategies: [
            "Mechanical lifting aids",
            "Team lifting",
            "Proper technique training",
            "Regular breaks",
          ],
        },
        "weather-exposure": {
          likelihood: "medium",
          consequence: "moderate",
          mitigationStrategies: [
            "Weather monitoring",
            "Work stoppage procedures",
            "Protective clothing",
            "Hydration protocols",
          ],
        },
      },
    };
  }

  /**
   * Analyze project using enhanced intelligence model
   */
  async analyzeProjectWithKnowledgeBase(input: {
    jobType: string;
    roofType: string;
    area: number;
    pitch: number;
    coastalExposure: boolean;
    difficultyLevel: string;
    location: string;
  }) {
    // Get relevant knowledge from knowledge base
    const materialRecommendations = this.getMaterialRecommendations(input);
    const complianceRequirements = this.getComplianceRequirements(input);
    const installationProcedure = this.getInstallationProcedure(input);
    const crewRequirements = this.getCrewRequirements(input);
    const riskAssessment = this.getRiskAssessment(input);

    // Use LLM for deep analysis with knowledge base context
    const analysis = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert roofing consultant with deep knowledge of Australian roofing standards, materials, and installation practices. Analyze the project and provide detailed recommendations based on the provided knowledge base context.`,
        },
        {
          role: "user",
          content: `Analyze this roofing project:
          
Project Details:
- Job Type: ${input.jobType}
- Roof Type: ${input.roofType}
- Area: ${input.area}m²
- Pitch: ${input.pitch}°
- Coastal Exposure: ${input.coastalExposure ? "Yes" : "No"}
- Difficulty Level: ${input.difficultyLevel}
- Location: ${input.location}

Knowledge Base Context:
${JSON.stringify({
  materialRecommendations,
  complianceRequirements,
  installationProcedure,
  crewRequirements,
  riskAssessment,
}, null, 2)}

Provide a comprehensive analysis including:
1. Material selection rationale
2. Compliance requirements summary
3. Installation methodology recommendations
4. Crew planning insights
5. Risk mitigation strategies
6. Cost optimization opportunities`,
        },
      ],
    });

    return {
      materialRecommendations,
      complianceRequirements,
      installationProcedure,
      crewRequirements,
      riskAssessment,
      llmAnalysis: analysis.choices[0].message.content,
    };
  }

  /**
   * Get material recommendations from knowledge base
   */
  private getMaterialRecommendations(input: any) {
    // Filter materials based on input criteria
    const suitableMaterials = Object.entries(this.knowledgeBase.materials.metalRoofing)
      .filter(([_, material]) => {
        if (input.coastalExposure && !material.compatibility.includes("Coastal")) {
          return false;
        }
        return true;
      })
      .map(([id, material]) => ({
        id,
        productName: material.productName,
        type: material.type,
        gauge: material.gauge,
        cost: material.cost.pricePerM2,
        properties: material.properties,
      }));

    return suitableMaterials;
  }

  /**
   * Get compliance requirements from knowledge base
   */
  private getComplianceRequirements(input: any) {
    return {
      australianStandards: this.knowledgeBase.compliance.australianStandards,
      regionalRequirements: this.knowledgeBase.compliance.regionalCodes[input.location] || {},
    };
  }

  /**
   * Get installation procedure from knowledge base
   */
  private getInstallationProcedure(input: any) {
    const procedureKey = `metal-roof-${input.roofType.toLowerCase()}`;
    return this.knowledgeBase.installation.procedures[procedureKey] || this.knowledgeBase.installation.procedures["metal-roof-gable"];
  }

  /**
   * Get crew requirements from knowledge base
   */
  private getCrewRequirements(input: any) {
    const jobTypeKey = input.jobType.toLowerCase().replace(/\s+/g, "-");
    const skillRequirements = this.knowledgeBase.crewIntelligence.skillLevelRequirements[jobTypeKey] || 
                              this.knowledgeBase.crewIntelligence.skillLevelRequirements["residential-reroof"];
    
    const crewSize = this.knowledgeBase.crewIntelligence.crewSizeRecommendations[input.difficultyLevel.toLowerCase()] ||
                     this.knowledgeBase.crewIntelligence.crewSizeRecommendations["medium"];

    return {
      skillRequirements,
      crewSize,
      equipment: this.knowledgeBase.crewIntelligence.equipmentRequirements["metal-roofing"],
    };
  }

  /**
   * Get risk assessment from knowledge base
   */
  private getRiskAssessment(input: any) {
    const difficultyIndicators = this.knowledgeBase.riskAssessment.difficultyIndicators[input.difficultyLevel.toLowerCase()] || [];
    const coastalFactors = input.coastalExposure ? this.knowledgeBase.riskAssessment.coastalExposureFactors : null;
    const safetyRisks = this.knowledgeBase.riskAssessment.safetyRiskMatrices;

    return {
      difficultyIndicators,
      coastalFactors,
      safetyRisks,
    };
  }

  /**
   * Get knowledge base for external access
   */
  getKnowledgeBase(): RoofingKnowledgeBase {
    return this.knowledgeBase;
  }
}

// Export singleton instance
export const enhancedIntelligenceModel = new EnhancedIntelligenceModel();

