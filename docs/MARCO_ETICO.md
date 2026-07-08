# Marco Ético de TesTEA

**Aviso Legal Importante:** TesTEA es estrictamente un **prototipo educativo y de investigación** de Machine Learning orientado al apoyo en el cribado temprano del Trastorno del Espectro Autista (TEA). **En ningún caso constituye una herramienta diagnóstica, ni es un producto sanitario aprobado o certificado.**

---

## 1. Alcance del proyecto
TesTEA ha sido desarrollado con fines de demostración técnica y académica para explorar cómo los modelos de aprendizaje automático pueden ayudar a identificar patrones de alerta temprana en el desarrollo infantil. Su uso previsto se limita a entornos de prueba, investigación y educación. El proyecto busca concienciar sobre el potencial de la tecnología como apoyo en la fase de triaje, pero nunca como reemplazo del juicio clínico humano.

## 2. Qué puede hacer TesTEA
* **Identificar patrones:** Analizar datos basados en cuestionarios conductuales estandarizados y detectar patrones estadísticos que históricamente se han correlacionado con rasgos del espectro autista.
* **Servir de señal de alerta temprana:** Proporcionar un indicador preliminar que sugiera si es recomendable o no buscar una evaluación profesional más detallada.
* **Agilizar el triaje:** En un escenario de uso bajo supervisión clínica, podría ayudar a los profesionales a priorizar la atención de aquellos casos que presenten mayores indicadores de riesgo.

## 3. Qué no puede hacer TesTEA
* **No puede emitir diagnósticos:** El diagnóstico del TEA es un proceso clínico complejo que requiere observación conductual directa, entrevistas exhaustivas a cuidadores y la evaluación integral por parte de profesionales especializados (neuropediatras, psicólogos, psiquiatras).
* **No sustituye el juicio médico:** Ningún resultado emitido por TesTEA debe ser interpretado como un consejo médico o psicológico definitivo.
* **No es un producto sanitario validado:** No ha sido sometido a ensayos clínicos, validación clínica formal, ni cuenta con la certificación de agencias reguladoras de la salud (como la AEMPS, FDA o EMA).

## 4. Riesgos de falsos negativos
Un falso negativo ocurre cuando el modelo indica una baja probabilidad de TEA en un caso que en la realidad sí lo presenta.
* **Riesgo ético:** Puede generar una falsa sensación de seguridad en las familias o educadores, retrasando significativamente la búsqueda de ayuda profesional y la intervención temprana, lo cual es un factor crítico en el desarrollo infantil.
* **Mitigación:** Es fundamental advertir claramente a los usuarios que, independientemente del resultado arrojado por la herramienta, si existen sospechas o preocupaciones sobre el desarrollo, se debe consultar siempre a un especialista.

## 5. Riesgos de falsos positivos
Un falso positivo ocurre cuando el modelo indica un riesgo alto de TEA en un caso neurotípico o que presenta otras condiciones de desarrollo diferentes.
* **Riesgo ético:** Puede provocar ansiedad aguda injustificada en las familias, estrés emocional y la potencial saturación innecesaria de los servicios médicos especializados.
* **Mitigación:** Los resultados de alto riesgo deben ser enmarcados exclusivamente como una "necesidad de mayor exploración" o "recomendación de consulta", y nunca como una confirmación o etiqueta de la condición.

## 6. Sesgos por sexo/género
Históricamente, los criterios de diagnóstico e instrumentos de cribado del autismo se han basado predominantemente en las manifestaciones clínicas de perfiles masculinos. Las niñas y mujeres en el espectro suelen presentar habilidades de "camuflaje" o "masking" social que los cuestionarios estándar pueden no capturar adecuadamente.
* **Impacto en TesTEA:** Si los datos de entrenamiento heredan este sesgo, el modelo podría presentar una menor sensibilidad a la hora de identificar rasgos en niñas, resultando en una mayor tasa de falsos negativos en la población femenina.

## 7. Sesgos por edad
Las manifestaciones conductuales del autismo cambian y evolucionan con la edad y el desarrollo. Los conjuntos de datos de entrenamiento suelen estar concentrados en rangos de edad específicos (usualmente en la primera infancia).
* **Impacto en TesTEA:** Aplicar el modelo a grupos de edad para los que no tiene suficiente representación en sus datos de entrenamiento (por ejemplo, adolescentes o adultos) reducirá drásticamente la fiabilidad y validez de sus predicciones.

## 8. Sesgos culturales y sobrerrepresentación anglosajona
Las herramientas de cribado originales y los grandes datasets públicos utilizados para entrenar modelos predictivos como TesTEA provienen de manera desproporcionada de poblaciones occidentales, específicamente de países anglosajones.
* **Impacto en TesTEA:** Las diferencias culturales en la expresión del comportamiento, el contacto visual, la comunicación no verbal y las normas sociales no están adecuadamente representadas. Esto podría generar predicciones inexactas o inapropiadas cuando el sistema se aplique en poblaciones con contextos socioculturales y socioeconómicos distintos.

## 9. Limitaciones por uso de DSM-5 frente a CIE-11
El modelo predictivo se apoya en datos etiquetados según criterios subyacentes que suelen estar alineados con manuales diagnósticos específicos, generalmente el DSM-5 (Asociación Estadounidense de Psiquiatría).
* **Impacto en TesTEA:** Existen diferencias clínicas, conceptuales y de codificación entre el DSM-5 y la CIE-11 (Organización Mundial de la Salud). Una herramienta de alcance global debería contemplar ambas perspectivas o, al menos, declarar explícitamente y de forma transparente qué marco clínico subyace en el entrenamiento de sus algoritmos.

## 10. Privacidad, minimización de datos y protección de datos
Dado que la herramienta procesa información relacionada con la salud (categoría especial de datos según normativas como el RGPD europeo), para un uso responsable, TesTEA debe alinearse con los siguientes principios:
* **Minimización de datos:** Solo se recabarán los datos de entrada estrictamente necesarios para el cálculo estadístico del modelo.
* **Anonimato y seguridad:** En su fase de prototipo, no se deben almacenar de forma persistente, ni transmitir a terceros, ni vincular a identidades reales los resultados de los cuestionarios.
* **Consentimiento informado:** Su uso requeriría siempre un consentimiento explícito, informado y revocable por parte del usuario o tutor legal, detallando la finalidad del tratamiento de los datos.

## 11. Recomendaciones antes de un despliegue real
Para que este prototipo pudiera evolucionar hacia un producto de uso real (clínico o comercial), sería indispensable cumplir con los siguientes hitos:
1. **Auditoría clínica independiente:** Validación exhaustiva del modelo predictivo utilizando cohortes prospectivas de pacientes reales en entornos clínicos, bajo la supervisión de un Comité de Ética de la Investigación (CEI).
2. **Estrategia de mitigación de sesgos:** Ampliar, balancear y auditar de forma continua los conjuntos de datos de entrenamiento para garantizar una representación justa y equitativa de diferentes géneros, etnias, culturas y rangos de edad.
3. **Certificación regulatoria:** Clasificar, auditar y certificar el software según las normativas vigentes sobre Productos Sanitarios (por ejemplo, como Software as a Medical Device - SaMD).
4. **Auditoría estricta de ciberseguridad:** Implementar arquitecturas que garanticen el cumplimiento absoluto de las leyes de protección de datos (RGPD y normativa aplicable de protección de datos) mediante cifrado robusto y procesos de auditoría externos.

## 12. Conclusión ética
La aplicación de la Inteligencia Artificial en el ámbito del neurodesarrollo tiene un enorme potencial para ampliar el acceso a herramientas de orientación y alerta temprana y reducir los tiempos de espera para el diagnóstico. Sin embargo, **la tecnología debe diseñarse para empoderar y actuar como copiloto de los profesionales sanitarios, nunca con el objetivo de reemplazarlos**. La máxima transparencia sobre las capacidades reales del sistema y, de forma aún más crítica, sobre sus limitaciones y sesgos inherentes, constituye el pilar ético innegociable de TesTEA. La protección emocional, clínica y de privacidad de los grupos vulnerables a los que va dirigida esta tecnología debe prevalecer por encima de cualquier interés en la innovación técnica.
