"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import servicesData from "@/app/(public)/services/services.json";

interface Service {
  id: number;
  categoryName: string;
  mainContent: {
    contentTitle: string;
    contentDescription: string;
  };
}

const QuotationForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    institution: "",
    address: "",
    phone: "",
    email: "",
    // Technical Details
    speciesName: "",
    speciesNameOther: "",
    tissueName: "",
    tissueNameOther: "",
    numberOfSamples: "",
    readRequired: "",
    readRequiredOther: "",
    basesRequired: "",
    basesRequiredOther: "",
    readLength: "",
    readLengthOther: "",
    sequencingPlatform: "",
    dataAnalysis: "",
  });

  const readRequiredServices = [
    "Gene Expression Analysis",
    "Genome Assembly",
    "Variant Detection",
    "Metagenomics",
    "Epigenetics"
  ];

  const isCustomService = service?.mainContent.contentTitle === "Customized Options tailored to your needs";
  const isReadRequiredService = service?.mainContent.contentTitle && 
    readRequiredServices.includes(service.mainContent.contentTitle);

  useEffect(() => {
    const serviceId = parseInt(id);
    const foundService = servicesData.find((s) => s.id === serviceId);
    if (foundService) {
      setService(foundService);
    }
  }, [id]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Special handling for custom service requests
    console.log({
      serviceId: id,
      serviceName: service?.mainContent.contentTitle,
      type: "Custom Service Request",
      customRequirements: {
        species: formData.speciesName,
        tissue: formData.tissueName,
        numberOfSamples: formData.numberOfSamples,
        sequencingDetails: {
          platform: formData.sequencingPlatform,
          readLength: formData.readLength,
          ...(isReadRequiredService 
            ? { readsRequired: formData.readRequired }
            : { basesRequired: formData.basesRequired }
          ),
        },
        dataAnalysis: formData.dataAnalysis,
      },
      contactInfo: {
        name: formData.name,
        institution: formData.institution,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      },
      timestamp: new Date().toISOString(),
      priority: "High",
      status: "Needs Review",
    });
    
    // You might want to send this to a different endpoint or handle it differently
    // router.push("/request-quotation/custom-success");
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Standard service request handling
    console.log({
      serviceId: id,
      serviceName: service?.mainContent.contentTitle,
      type: "Standard Service Request",
      technicalDetails: {
        species: formData.speciesName === "other" ? formData.speciesNameOther : formData.speciesName,
        tissue: formData.tissueName === "other" ? formData.tissueNameOther : formData.tissueName,
        numberOfSamples: formData.numberOfSamples,
        sequencingDetails: {
          platform: formData.sequencingPlatform,
          readLength: formData.readLength === "other" ? formData.readLengthOther : formData.readLength,
          ...(isReadRequiredService 
            ? { 
                readsRequired: formData.readRequired === "other" 
                  ? formData.readRequiredOther 
                  : formData.readRequired 
              }
            : { 
                basesRequired: formData.basesRequired === "other" 
                  ? formData.basesRequiredOther 
                  : formData.basesRequired 
              }
          ),
        },
        dataAnalysis: formData.dataAnalysis,
      },
      contactInfo: {
        name: formData.name,
        institution: formData.institution,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      },
      timestamp: new Date().toISOString(),
    });
    
    // router.push("/request-quotation/success");
  };

  const handleSubmit = isCustomService ? handleCustomSubmit : handleStandardSubmit;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-2xl text-purple-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 to-white mt-40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">
            {service.mainContent.contentTitle}
          </h1>
          <p className="text-gray-600 mb-6">{service.mainContent.contentDescription}</p>
          <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="space-y-6">
            {/* Species Name */}
            <div>
              <label htmlFor="speciesName" className="block text-sm font-medium text-gray-700 mb-2">
                Species Name
              </label>
              {isCustomService ? (
                <input
                  type="text"
                  id="speciesName"
                  name="speciesName"
                  value={formData.speciesName}
                  onChange={handleChange}
                  placeholder="Enter species name"
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              ) : (
                <>
                  <select
                    id="speciesName"
                    name="speciesName"
                    value={formData.speciesName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Species Type</option>
                    <option value="human">Human</option>
                    <option value="plant">Plant</option>
                    <option value="animal">Animal</option>
                    <option value="bacteria">Bacteria</option>
                    <option value="other">Other</option>
                  </select>
                  {formData.speciesName === "other" && (
                    <input
                      type="text"
                      id="speciesNameOther"
                      name="speciesNameOther"
                      value={formData.speciesNameOther}
                      onChange={handleChange}
                      placeholder="Please specify species"
                      className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  )}
                </>
              )}
            </div>

            {/* Tissue Name */}
            <div>
              <label htmlFor="tissueName" className="block text-sm font-medium text-gray-700 mb-2">
                Tissue Name
              </label>
              {isCustomService ? (
                <input
                  type="text"
                  id="tissueName"
                  name="tissueName"
                  value={formData.tissueName}
                  onChange={handleChange}
                  placeholder="Enter tissue name"
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              ) : (
                <>
                  <select
                    id="tissueName"
                    name="tissueName"
                    value={formData.tissueName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Tissue Type</option>
                    <option value="blood">Blood</option>
                    <option value="root">Root</option>
                    <option value="stem">Stem</option>
                    <option value="skin">Skin</option>
                    <option value="other">Other</option>
                  </select>
                  {formData.tissueName === "other" && (
                    <input
                      type="text"
                      id="tissueNameOther"
                      name="tissueNameOther"
                      value={formData.tissueNameOther}
                      onChange={handleChange}
                      placeholder="Please specify tissue type"
                      className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  )}
                </>
              )}
            </div>

            {/* Number of Samples */}
            <div>
              <label htmlFor="numberOfSamples" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Samples
              </label>
              <input
                type="number"
                id="numberOfSamples"
                name="numberOfSamples"
                value={formData.numberOfSamples}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Read/Bases Required */}
            <div>
              <label htmlFor={isReadRequiredService ? "readRequired" : "basesRequired"} className="block text-sm font-medium text-gray-700 mb-2">
                {isReadRequiredService ? "Read Required (M)" : "Bases Required (GB)"}
              </label>
              {isCustomService ? (
                <input
                  type="text"
                  id={isReadRequiredService ? "readRequired" : "basesRequired"}
                  name={isReadRequiredService ? "readRequired" : "basesRequired"}
                  value={isReadRequiredService ? formData.readRequired : formData.basesRequired}
                  onChange={handleChange}
                  placeholder={isReadRequiredService ? "Enter reads required in millions (M)" : "Enter bases required in gigabases (GB)"}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              ) : (
                <>
                  {isReadRequiredService ? (
                    <>
                      <select
                        id="readRequired"
                        name="readRequired"
                        value={formData.readRequired}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select Read Required</option>
                        <option value="10M">10M</option>
                        <option value="20M">20M</option>
                        <option value="30M">30M</option>
                        <option value="50M">50M</option>
                        <option value="other">Other</option>
                      </select>
                      {formData.readRequired === "other" && (
                        <input
                          type="text"
                          id="readRequiredOther"
                          name="readRequiredOther"
                          value={formData.readRequiredOther}
                          onChange={handleChange}
                          placeholder="Please specify read required in millions (M)"
                          className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <select
                        id="basesRequired"
                        name="basesRequired"
                        value={formData.basesRequired}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select Bases Required</option>
                        <option value="1GB">1GB</option>
                        <option value="5GB">5GB</option>
                        <option value="10GB">10GB</option>
                        <option value="30GB">30GB</option>
                        <option value="other">Other</option>
                      </select>
                      {formData.basesRequired === "other" && (
                        <input
                          type="text"
                          id="basesRequiredOther"
                          name="basesRequiredOther"
                          value={formData.basesRequiredOther}
                          onChange={handleChange}
                          placeholder="Please specify bases required in gigabases (GB)"
                          className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Read Length */}
            <div>
              <label htmlFor="readLength" className="block text-sm font-medium text-gray-700 mb-2">
                Read Length
              </label>
              {isCustomService ? (
                <input
                  type="text"
                  id="readLength"
                  name="readLength"
                  value={formData.readLength}
                  onChange={handleChange}
                  placeholder="Enter read length (e.g., PE-150x2)"
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              ) : (
                <>
                  <select
                    id="readLength"
                    name="readLength"
                    value={formData.readLength}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Read Length</option>
                    <option value="PE-50x2">PE-50x2</option>
                    <option value="PE-100x2">PE-100x2</option>
                    <option value="PE-150x2">PE-150x2</option>
                    <option value="other">Other</option>
                  </select>
                  {formData.readLength === "other" && (
                    <input
                      type="text"
                      id="readLengthOther"
                      name="readLengthOther"
                      value={formData.readLengthOther}
                      onChange={handleChange}
                      placeholder="Please specify read length"
                      className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  )}
                </>
              )}
            </div>

            {/* Sequencing Platform */}
            <div>
              <label htmlFor="sequencingPlatform" className="block text-sm font-medium text-gray-700 mb-2">
                Sequencing Platform
              </label>
              {isCustomService ? (
                <input
                  type="text"
                  id="sequencingPlatform"
                  name="sequencingPlatform"
                  value={formData.sequencingPlatform}
                  onChange={handleChange}
                  placeholder="Enter sequencing platform"
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              ) : (
                <select
                  id="sequencingPlatform"
                  name="sequencingPlatform"
                  value={formData.sequencingPlatform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Platform</option>
                  <option value="MGI">MGI</option>
                  <option value="Illumina">Illumina</option>
                  <option value="PacBio">PacBio</option>
                  <option value="Nanopore">Nanopore</option>
                </select>
              )}
            </div>

            {/* Data Analysis */}
            <div>
              <label htmlFor="dataAnalysis" className="block text-sm font-medium text-gray-700 mb-2">
                Data Analysis
              </label>
              {isCustomService ? (
                <input
                  type="text"
                  id="dataAnalysis"
                  name="dataAnalysis"
                  value={formData.dataAnalysis}
                  onChange={handleChange}
                  placeholder="Enter data analysis requirements"
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              ) : (
                <select
                  id="dataAnalysis"
                  name="dataAnalysis"
                  value={formData.dataAnalysis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Analysis Type</option>
                  <option value="standard">Standard</option>
                  <option value="advanced">Advanced</option>
                  <option value="none">None</option>
                </select>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Personal Information</h2>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Institution */}
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
              >
                Request Quotation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationForm; 